import { PlaywrightBlocker, adsAndTrackingLists } from '@cliqz/adblocker-playwright'
import fetch from 'cross-fetch'
import express from 'express'
import boolParser from 'express-query-boolean'
import normalizeUrl from 'normalize-url'
import { chromium } from 'playwright'
import { assertEquals } from 'typescript-is'

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
            res.status(422).send(e)
            return
        }
        const response = await takeScreenshot(options)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
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

    const browser = await chromium.launch()
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
        switch (screenshotMode) {
            case 'normal':
                return await page.screenshot()
            case 'full':
                return await page.screenshot({ fullPage: true })
            case 'element':
                return await page.locator('body>*').first().screenshot()
        }
    } finally {
        await browser.close()
    }
}
