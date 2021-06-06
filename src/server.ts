import express from 'express'
import puppeteer, {NavigationOptions} from 'puppeteer'
import {PuppeteerBlocker} from '@cliqz/adblocker-puppeteer';
import isDocker from 'is-docker'
import {assertEquals} from "typescript-is";
import normalizeUrl from 'normalize-url'
import fetch from 'cross-fetch'


const boolParser = require('express-query-boolean')

export const app = express()
export const port = process.env.WEBSITE_SCREENSHOT_PORT ?? 3000

interface Options {
    input: string
    full?: boolean
    blockAds?: boolean
}

app.use(boolParser())

app.get('/', async (req, res) => {
    try {
        let options: Options
        try {
            options = assertEquals<Options>(req.query)
        } catch(e) {
            res.status(422).send(e.toString())
            return
        }
        const response = await takeScreenshot(decodeURIComponent(options.input), options.full, options.blockAds)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        console.error(err)
        res.status(500).send(err.toString())
    }
})

async function takeScreenshot(input: string, fullPage = false, blockAds = true) {
    const inputType: 'url' | 'html' = input.startsWith('<') ? 'html' : 'url'
    const normalizedInput = inputType === 'url' ? normalizeUrl(input) : input
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 1280,
            height: 800
        },
        executablePath: isDocker() ? 'google-chrome-unstable' : undefined
    })
    try {
        const page = await browser.newPage()
        if (blockAds)
            await (await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch)).enableBlockingInPage(page)
        page.on('dialog', dialog => dialog.dismiss())
        const options: NavigationOptions = {waitUntil: 'networkidle0'}
        await (inputType === 'url'
            ? page.goto(normalizedInput, options)
            : page.setContent(normalizedInput, options))
        return await page.screenshot({encoding: "binary", fullPage})
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}
