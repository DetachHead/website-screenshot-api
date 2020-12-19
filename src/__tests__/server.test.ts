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
    test('html', done =>
        supertest(app)
            .get(`/?input=${inputHTML}`)
            .expect(200, done)
    )

    test('html full', done =>
        supertest(app)
            .get(`/?full=true&input=${inputHTML}`)
            .expect(200, done)
    )
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
            .expect(500, done)
    )
})