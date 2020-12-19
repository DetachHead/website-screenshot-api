import express from 'express'
import captureWebsite from 'capture-website'
import isDocker from 'is-docker'
import {assertEquals} from "typescript-is";
import normalizeUrl from 'normalize-url'
const boolParser = require('express-query-boolean')

const app = express()
const port = process.env.WEBSITE_SCREENSHOT_PORT ?? 3000

interface Options {
    input: string
    full?: boolean
}

app.use(boolParser())

app.get('/', async (req, res, next) => {
    try {
        const options = assertEquals<Options>(req.query)
        const inputType: 'url' | 'html' = options.input.startsWith('<') ? 'html' : 'url'
        const input = inputType === 'url'? normalizeUrl(options.input): options.input
        const captureOptions: captureWebsite.Options = {
            defaultBackground: true,
            delay: 0.5,
            inputType,
            fullPage: options.full,
            scaleFactor: 1,
            //if using our image, the chrome path has to be specified (https://stackoverflow.com/a/62383642)
            launchOptions: isDocker() ? {executablePath: 'google-chrome-unstable'} : {}
        }
        const response = await captureWebsite.buffer(input, captureOptions)
        res.set('Content-Type', 'image/png')
        res.send(response)
    } catch (err) {
        //TODO: better erroring
        console.error(err)
        next(err)
    }
})

app.listen(port, () =>
    console.log(`listening at http://localhost:${port}`)
)