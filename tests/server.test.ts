import { app, port } from '../src/server'
import * as http from 'http'
import supertest from 'supertest'

const inputHTML = encodeURIComponent('<h1>foo</h1>')

let server: http.Server

beforeAll(() => (server = app.listen(port)))

afterAll((done) => {
    server.close(done)
})

describe('positive', () => {
    describe('html', () => {
        test('screenshotMode=full', () =>
            supertest(app).get(`/?screenshotMode=full&input=${inputHTML}`).expect(200))
        test('screenshotMode=normal', () => supertest(app).get(`/?input=${inputHTML}`).expect(200))
        describe('screenshotMode=element', () => {
            test('happy path', () => supertest(app).get(`/?input=${inputHTML}`).expect(200))
            describe('fallback to normal', () => {
                test('0 child elements', () =>
                    supertest(app).get('/?input=<html>test</html>').expect(200))
                test('>1 child elements', () =>
                    supertest(app).get(`/?input=${inputHTML}${inputHTML}`).expect(200))
            })
        })
    })
    describe('site', () => {
        // test it on itself
        const site = `localhost:${port}`
        test('without protocol', () => supertest(app).get(`/?input=${site}`).expect(200))
        test('with protocol', () => supertest(app).get(`/?input=http://${site}`).expect(200))
    })
})

describe('negative', () => {
    test('invalid site', () =>
        supertest(app).get('/?input=www.sdfgsdfg.asdfasdfadsgsdf').expect(500))
    test('no input', () => supertest(app).get('/').expect(422))
})
