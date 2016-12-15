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

  it('should navigate to Login Page', function() {
    mainPage.navItem.then(function(items) {
      items[0].click();
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
    });
  });

});

describe('Kard Login View', function() {
  let login;

  const placeholder = {
    text: 'placeholder',
    email: 'Email address',
    password: 'Password',
  };

  const loginUser = {
    _id: '5845be96a888ea1003feda19',
    email: 'polpol@gmail.com',
    password: 'password82'
  };

  it('should navigate to Login page URL', function() {
    let promise = browser.get(config.baseUrl + '/login');
    login = require('./login.po');
    return promise;
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
  });

  it('should display 2 Input fields', function() {
    login.input.then(function(items) {
      expect(items.length).to.equal(2);
      expect(items[0].getAttribute(placeholder.text)).to.eventually.equal(placeholder.email);
      expect(items[1].getAttribute(placeholder.text)).to.eventually.equal(placeholder.password);
    });
  });

  it('should be able to login for a existing user', function() {
    login.email.sendKeys(loginUser.email);
    login.password.sendKeys(loginUser.password);
    login.button.click();
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
  });

  it('should create a localStorage item as User logged-in', function() {
    let localStorageUser;
    browser.executeScript("return window.localStorage.getItem('user');").then(user => {
      localStorageUser = JSON.parse(user);
      expect(localStorageUser).to.exist;
      expect(localStorageUser).to.be.instanceOf(Object);
      expect(localStorageUser).to.have.any.keys(['_id', 'email', 'token']);
      expect(localStorageUser._id).to.equal(loginUser._id);
      expect(localStorageUser.email).to.equal(loginUser.email);
    });
  });

  it('should create a new token for localStorage', function() {
    browser.executeScript("return window.localStorage.getItem('token');").then(token => {
        expect(token).to.exist;
        expect(token).to.be.string;
    });
  });

});
