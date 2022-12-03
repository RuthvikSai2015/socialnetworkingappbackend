// /*
//  * Test suite for profile
//  */
require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;

describe('Validate Profile functionality', () => {
    let regUser = {username: 'sara123', password: '1234'};
  
    it('should get correct headline', (done) => {

        fetch(url('/headline/test'),{
            method: 'GET',
            headers: {'Content-Type': 'application/json' }
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('test');
            expect(res.headline).toEqual('tests initial headline');
            done();
        })
    });

    it('should put correct headline to given user', (done) => {
      let newHeadline = "this is new headline";
        fetch(url('/headline'),{
            method: 'PUT',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({"headline": newHeadline})
        }).then(res => res.json()).then(res => {
            expect(res.headline).toEqual(newHeadline);
            done();
        })
    })
})