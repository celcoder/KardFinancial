'use strict';

var app = require('../..');
import request from 'supertest';

describe('User API:', function() {

  describe('When new user is created Email: testing@gmail.com', function() {
    it('should return an 200 response', function(done) {
      request(app)
        .post('/api/users/signup')
        .send({
          email: 'deleteme@gmail.com',
          password: 'test123',
          passwordConfirmation: 'test123'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.user).to.be.instanceOf(Object);
          expect(res.body.user.email).to.equal('deleteme@gmail.com');
          done();
        });
    });
  });


  describe('When user enters the wrong Password Info', function() {
    it('should return an Error Message', function(done) {
      request(app)
        .post('/api/users/signup')
        .send({
          email: 'failed@gmail.com',
          password: 'test123',
          passwordConfirmation: 'test321'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.equal('Password and password confirmation must match');
          done();
        });
    });
  });

  describe('When user enters the wrong Email Info', function() {
    it('should return an Error Message', function(done) {
      request(app)
        .post('/api/users/signup')
        .send({
          email: 'failed@gmail.c',
          password: 'test123',
          passwordConfirmation: 'test123'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.equal('Invalid Email');
          done();
        });
    });
  });

  describe('When User Logs In', function() {
    it('should return an 200 response', function(done) {
      request(app)
        .post('/api/users/login')
        .send({
          email: 'servertesting@gmail.com',
          password: 'testing123'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.user).to.be.instanceOf(Object);
          expect(res.body.user.email).to.equal('servertesting@gmail.com');
          done();
        });
    });
  });

  xdescribe('When user enters the wrong login Info', function() {
    it('should return an Error Message', function(done) {
      request(app)
        .post('/api/users/login')
        .send({
          email: 'deleteme@gmail.com',
          password: 'unkwon123',
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.equal('Incorrect Email Address or Password');
          done();
        });
    });
  });
});

