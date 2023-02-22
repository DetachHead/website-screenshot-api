import express from 'express'
import {chromium} from 'playwright'
import {adsAndTrackingLists, PlaywrightBlocker} from '@cliqz/adblocker-playwright';
import {assertEquals} from "typescript-is";
import normalizeUrl from 'normalize-url'
import fetch from 'cross-fetch'


const boolParser = require('express-query-boolean')

export const app = express()
export const port = process.env.WEBSITE_SCREENSHOT_PORT ?? 3000

interface Options {
    input: string
    screenshotMode?: 'normal'|'full'|'element'
    blockAds?: boolean
}

app.use(boolParser())

app.get('/', async (req, res) => {
    try {
        let options: Options
        try {
            options = assertEquals<Options>(req.query)
        } catch (e) {
            res.status(422).send(e.toString())
            return
        }
        const response = await takeScreenshot(options)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        console.error(err)
        res.status(500).send(err.toString())
    }
})

async function takeScreenshot({input, screenshotMode, blockAds}: Options) {
    const inputType: 'url' | 'html' = input.startsWith('<') ? 'html' : 'url'
    const normalizedInput = inputType === 'url' ? normalizeUrl(input) : input

    const browser = await chromium.launch()
    try {
        const page = await browser.newPage({
            viewport: {
                width: 1280,
                height: 800
            }
        })
        if (blockAds)
            await (await PlaywrightBlocker.fromLists(fetch, [
                ...adsAndTrackingLists,
                'https://raw.githubusercontent.com/DetachHead/ublock-filters/master/list.txt',
                'https://raw.githubusercontent.com/ethan-xd/ethan-xd.github.io/master/fb.txt',
                'https://raw.githubusercontent.com/ethan-xd/ethan-xd.github.io/master/rdt.txt'
            ])).enableBlockingInPage(page)
        page.on('dialog', dialog => dialog.dismiss())
        const options = {waitUntil: 'networkidle'} as const
        await (inputType === 'url'
            ? page.goto(normalizedInput, options)
            : page.setContent(normalizedInput, options))
        if (screenshotMode === undefined) {
            screenshotMode = inputType === 'url'? 'normal': 'element'
        }
        switch(screenshotMode) {
            case 'normal':
                return await page.screenshot()
            case 'full':
                return await page.screenshot({fullPage: true})
            case 'element':
                return await page.locator('body>*').first().screenshot()
        }
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}
