'use strict';

var app = require('../..');
import request from 'supertest';

describe('Password API:', function() {

  describe('When password does not equal password confirmation', function() {
    let errorMessage;
    it('should return an 403 FORBIDDEN response', function(done) {
      request(app)
        .post('/api/passwords/reset')
        .send({
          user: { _id: '5858218eb3fa6c17ce930af3' },
          passwordOld: 'testing123',
          passwordNew: 'not a match',
          passwordConfirmation: 'not a match match'
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          errorMessage = res.body;
          expect(errorMessage).to.equal('password and password confirmation must match');
          done();
        });
    });
  });

  describe('Successful password change', function() {
    let newPassword;

    beforeEach(function(done) {
      request(app)
        .post('/api/passwords/reset')
        .send({
          user: { _id: '5858218eb3fa6c17ce930af3' },
          passwordOld: 'testing123',
          passwordNew: '123testing',
          passwordConfirmation: '123testing'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newPassword = res.body;
          done();
        });
    });

    afterEach(function(done) {
      request(app)
        .post('/api/passwords/reset')
        .send({
          user: { _id: '5858218eb3fa6c17ce930af3' },
          passwordOld: '123testing',
          passwordNew: 'testing123',
          passwordConfirmation: 'testing123'
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with success message', function() {
      expect(newPassword.message).to.equal('successfully changed password');
    });
  });

  describe('POST /api/passwords/recover', function() {
    it('should return an 200 response', function(done) {
      request(app)
        .post('/api/passwords/recover')
        .send({ 'email': 'passwordreset@gmail.com' })
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

