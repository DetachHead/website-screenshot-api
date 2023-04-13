import { PlaywrightBlocker, adsAndTrackingLists } from '@cliqz/adblocker-playwright'
import fetch from 'cross-fetch'
import express from 'express'
import boolParser from 'express-query-boolean'
import normalizeUrl from 'normalize-url'
import { firefox } from 'playwright'
import { assertEquals } from 'typia'

export const app = express()
export const port = process.env['WEBSITE_SCREENSHOT_PORT'] ?? 3000

interface Options {
    input: string
    screenshotMode?: 'normal' | 'full' | 'element'
    blockAds?: boolean
}

app.use(boolParser())

// eslint-disable-next-line @typescript-eslint/no-misused-promises -- dont care
app.get('/', async (req, res) => {
    try {
        let options: Options
        try {
            options = assertEquals<Options>(req.query)
        } catch (e) {
            res.status(422).send(String(e))
            return
        }
        const response = await takeScreenshot(options)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        const errorText = String(err)
        console.error(errorText)
        res.status(500).send(`<pre>${errorText}</pre>`)
    }
})

const takeScreenshot = async ({ input, screenshotMode, blockAds }: Options) => {
    const inputType: 'url' | 'html' = input.startsWith('<') ? 'html' : 'url'
    if (screenshotMode === undefined) {
        screenshotMode = inputType === 'url' ? 'normal' : 'element'
    }
    if (inputType === 'url' && screenshotMode === 'element') {
        input = `<span>${input}</span>`
    }
    const normalizedInput = inputType === 'url' ? normalizeUrl(input) : input

    const browser = await firefox.launch()
    try {
        const page = await browser.newPage({
            viewport: {
                width: 1280,
                height: 800,
            },
        })
        if (blockAds)
            await (
                await PlaywrightBlocker.fromLists(fetch, [
                    ...adsAndTrackingLists,
                    'https://raw.githubusercontent.com/DetachHead/ublock-filters/master/list.txt',
                    'https://raw.githubusercontent.com/ethan-xd/ethan-xd.github.io/master/fb.txt',
                    'https://raw.githubusercontent.com/ethan-xd/ethan-xd.github.io/master/rdt.txt',
                ])
            ).enableBlockingInPage(page)
        page.on('dialog', (dialog) => void dialog.dismiss())
        const options = { waitUntil: 'networkidle' } as const
        await (inputType === 'url'
            ? page.goto(normalizedInput, options)
            : page.setContent(normalizedInput, options))
        if (screenshotMode === 'full') {
            return await page.screenshot({ fullPage: true })
        } else {
            if (screenshotMode === 'element') {
                const locator = page.locator('body>*')
                // TODO: wrap elements in a span if >1 element
                if ((await locator.count()) === 1) {
                    return await locator.screenshot()
                }
            }
            // if screenshotMode is normal, or element and body had anything other than 1 child element in which case we fallback to normal mode:
            return await page.screenshot()
        }
    } finally {
        await browser.close()
    }
}
