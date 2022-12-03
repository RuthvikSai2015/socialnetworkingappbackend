/*
 * Test suite for login
 */
require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;

describe('Validate Registration and Login functionality', () => {

    it('register new user', (done) => {
        let regUser = {username: 'sara123', password: '1234'};
        fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regUser)
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('sara123');
            expect(res.result).toEqual('success');
            done();
        });
    });

    it('login user', (done) => {
        let loginUser = {username: 'sara123', password: '1234'};
        fetch(url('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginUser)
        }).then(res => {
            return res.json()
        }).then(res => {
            expect(res.username).toEqual('sara123');
            expect(res.result).toEqual('success');
            done();
        });
    });

    it('logout user', (done) => {
        let cookie;
        let logoutUser = {username: 'sara123', password: '1234'};
        beforeEach((done) => {
            fetch(url('/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logoutUser)
            }).then(temp => temp.json()).then((res) =>{cookie = 'sid=' + res['sid']; done();})
        })
        fetch(url('/logout'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        }).then(temp => temp.json()).then(res => {
            expect(res.result).toEqual('logout success');
            done();
        });
    });

});
