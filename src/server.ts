import express from 'express'
import puppeteer from 'puppeteer'
import isDocker from 'is-docker'
import {assertEquals} from "typescript-is";
import normalizeUrl from 'normalize-url'


const boolParser = require('express-query-boolean')

export const app = express()
export const port = process.env.WEBSITE_SCREENSHOT_PORT ?? 3000

interface Options {
    input: string
    full?: boolean
}

app.use(boolParser())

app.get('/', async (req, res, next) => {
    try {
        const options = assertEquals<Options>(req.query)
        const response = await takeScreenshot(decodeURIComponent(options.input), options.full)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        //TODO: better erroring
        console.error(err)
        next(err)
    }
})

async function takeScreenshot(input: string, fullPage = false) {
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
        page.on('dialog', dialog => dialog.dismiss())
        await (inputType === 'url' ? page.goto : page.setContent)(normalizedInput)
        return await page.screenshot({encoding: "binary", fullPage})
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}