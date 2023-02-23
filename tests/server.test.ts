import { app, port } from '../src/server'
import * as http from 'http'
import supertest from 'supertest'

const inputHTML = encodeURIComponent('<h1>foo</h1><b>bar</b>')

let server: http.Server

beforeAll(() => (server = app.listen(port)))

afterAll(() => server.close())

describe('positive', () => {
    describe('html', () => {
        test('screenshotMode=full', (done) => {
            void supertest(app).get(`/?screenshotMode=full&input=${inputHTML}`).expect(200, done)
        })
        test('screenshotMode=normal', (done) => {
            void supertest(app).get(`/?input=${inputHTML}`).expect(200, done)
        })
        test('screenshotMode=element', (done) => {
            void supertest(app).get(`/?input=${inputHTML}`).expect(200, done)
        })
    })
    describe('site', () => {
        // test it on itself
        const site = `localhost:${port}`
        test('without protocol', (done) => {
            void supertest(app).get(`/?input=${site}`).expect(200, done)
        })
        test('with protocol', (done) => {
            void supertest(app).get(`/?input=http://${site}`).expect(200, done)
        })
    })
})

describe('negative', () => {
    test('invalid site', (done) => {
        void supertest(app).get('/&input=www.sdfgsdfg.asdfasdfadsgsdf').expect(404, done)
    })
    test('no input', (done) => {
        void supertest(app).get('/').expect(422, done)
    })
})
