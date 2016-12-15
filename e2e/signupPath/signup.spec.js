'use strict';

const config = browser.params;

describe('Kard Main View', function() {
  let mainPage;
  //this beforeEach block will run before every IT blocks.
  //this is an async operation. Hence it returns a promise.
  // beforeEach(function() {
  //   let promise = browser.get(config.baseUrl + '/');
  //   mainPage = require('./main.po');
  //   return promise;
  // });

  it('should navigate to home page URL', function() {
    let promise = browser.get(config.baseUrl + '/');
    mainPage = require('../components/main.po');
    return promise;
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/');
  });

  it('should display Nav-Bar with 2 items', function() {
    mainPage.navItem.then(function(items) {
      expect(items.length).to.equal(2);
      expect(items[0].getText()).to.eventually.equal('Login');
      expect(items[1].getText()).to.eventually.equal('Signup');
    });
  });

  it('should navigate to Signup Page', function() {
    mainPage.navItem.then(function(items) {
      items[1].click();
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/signup');
    });
  });

});

describe('Kard Signup View', function() {
  let signUp;

  const placeholder = {
    text: 'placeholder',
    email: 'Email address',
    password: 'Password',
    repassword: 'Re-type password'
  };

  const newUser = {
    email: 'testingkard@gmail.com',
    password: 'password321',
    repassword: 'password321'
  };


  it('should navigate to Signup page URL', function() {
    let promise = browser.get(config.baseUrl + '/signup');
    signUp = require('./signup.po');
    return promise;
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/signup');
  });

  it('should display 3 Input fields', function() {
    signUp.input.then(function(items) {
      expect(items.length).to.equal(3);
      expect(items[0].getAttribute(placeholder.text)).to.eventually.equal(placeholder.email);
      expect(items[1].getAttribute(placeholder.text)).to.eventually.equal(placeholder.password);
      expect(items[2].getAttribute(placeholder.text)).to.eventually.equal(placeholder.repassword);
    });
  });

  it('should create a new account for a newUser', function() {
    signUp.email.sendKeys(newUser.email);
    signUp.password.sendKeys(newUser.password);
    signUp.passwordConfirmation.sendKeys(newUser.repassword);
    signUp.button.click();
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/onboard/cards');
  });

  it('should create a new token for localStorage', function() {
    browser.executeScript("return window.localStorage.getItem('token');").then(token => {
        expect(token).to.exist;
        expect(token).to.be.string;
    });
  });

  it('should create a localStorage item as newUser', function() {
    let localStorageUser;
    browser.executeScript("return window.localStorage.getItem('user');").then(user => {
      localStorageUser = JSON.parse(user);
      expect(localStorageUser).to.exist;
      expect(localStorageUser).to.be.instanceOf(Object);
      expect(localStorageUser).to.have.any.keys(['_id', 'email', 'token']);
      expect(localStorageUser.email).to.equal(newUser.email);
    });
  });

});


