const request = require('supertest');
const app = require('../app');

describe('#test koa app', () => {

    let server = app.listen(9900);

    describe('#test server', () => {
        it('#test GET /', async() => {
            let res = await request(server)
                .get('/chat')
                .expect('Content-Type', /text\/html/)
                .expect(200);
        });
    });
});