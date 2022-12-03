/*
 * Test suite for articles
 */
require('es6-promise').polyfill();
require('isomorphic-fetch');
const url = path => `http://localhost:3000${path}`;
describe('Validate Article functionalities', () => {

    it('should get current user related articles', (done) => {
        fetch(url('/articles'), {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => {
                expect(res.status).toEqual(200)
                return res.json()
            })
            .then(res => {
                expect(res.length).toEqual(0)
                done();
            })

    })
    it('should add an articles to the existing current user articles', (done) => {
        let temp = {text: "This is a test article"}
        fetch(url('/article'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"text": "This is a test article"})
        }).then(res => {
            expect(res.status).toEqual(200)
            done();
        })

    })

    it('should put an articles to the current user articles', (done) => {
        let temp = {text: "This is a test article"}
        fetch(url('/articles/1'), {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"text": "This is a test article"})
        }).then(res => {
            expect(res.status).toEqual(200)
            done();
        })

    })

})
