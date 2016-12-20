'use strict';

var app = require('../..');
import request from 'supertest';

describe('Cards API:', function() {

  describe('Successful Card search get request', function() {
    let cards;
    it('should return an 200 response', function(done) {
      request(app)
        .get('/api/cards/search?q=chase')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          cards = res.body;
          expect(cards).to.be.instanceOf(Array);
          done();
        });
    });
  });

  describe('When card is not found', function() {
    let errorMessage;
    it('should return an 404 NOT FOUND ERROR message', function(done) {
      request(app)
        .get('/api/passwords/search?q=unknown')
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          errorMessage = res.body;
          expect(errorMessage).to.be.instanceOf(Object);
          done();
        });
    });
  });
});
