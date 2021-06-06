import supertest from 'supertest'
import {app, port} from "../server";
import * as http from "http";

const inputHTML = encodeURIComponent('<h1>foo</h1><b>bar</b>')

let server: http.Server

beforeAll(() =>
    server = app.listen(port)
)

afterAll(() => server.close())

describe('positive', () => {
    describe('html', () => {
        test('full=true', done =>
            supertest(app)
                .get(`/?full=true&input=${inputHTML}`)
                .expect(200, done)
        )
        test('full=false', done =>
            supertest(app)
                .get(`/?input=${inputHTML}`)
                .expect(200, done)
        )
    })
    describe('site', () => {
        //test it on itself
        const site = `localhost:${port}`
        test('without protocol', done =>
            supertest(app)
                .get(`/?input=${site}`)
                .expect(200, done)
        )
        test('with protocol', done =>
            supertest(app)
                .get(`/?input=http://${site}`)
                .expect(200, done)
        )
    })
})

describe('negative', () => {
    test('invalid site', done =>
        supertest(app)
            .get('/&input=www.sdfgsdfg.asdfasdfadsgsdf')
            .expect(404, done)
    )
    test('no input', done =>
        supertest(app)
            .get('/')
            .expect(422, done)
    )
})
