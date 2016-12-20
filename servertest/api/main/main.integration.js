'use strict';

var app = require('../..');
import request from 'supertest';

describe('Main API:', function() {
  describe('GET /api', function() {
    it('should return an 200 response', function(done) {
      request(app)
        .get('/api')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });
  });

});
