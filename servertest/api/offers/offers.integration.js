'use strict';

var app = require('../..');
import request from 'supertest';

describe('Offers API:', function() {

  describe('Successful get Offers Request is made', function() {
    it('should return an 200 response', function(done) {
      request(app)
        .get('/api/offers/581a91a4f4c81e2b0c41ca24')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          let offers = res.body;
          expect(offers).to.be.instanceOf(Array);
          expect(offers[0]._id).to.be.String;
          expect(offers[0].merchant).to.be.instanceOf(Object);
          expect(offers[0].bank).to.equal('American Express');
          done();
        });
    });
  });

  describe('Errors get Offers Request is made', function() {
    it('should return an 500 response', function(done) {
      request(app)
        .get('/api/offers/584c527393c39f04e0')
        .expect(500)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          let offers = res.body;
          expect(offers).to.be.instanceOf(Object);
          done();
        });
    });
  });

});
