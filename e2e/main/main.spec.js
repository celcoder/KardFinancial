'use strict';

const config = browser.params;

xdescribe('Kard Main View', function() {
  let mainPage;
  // this beforeEach block will run before every IT blocks.
  // this is an async operation. Hence it returns a promise.
  beforeEach(function() {
    let promise = browser.get(config.baseUrl + '/');
    mainPage = require('./main.po');
    return promise;
  });

  it('should navigate to home page URL', function() {
    expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/');
  });

  it('should display Nav-Bar with 2 items', function() {
    mainPage.navItem.then(function(items) {
      expect(items.length).to.equal(2);
      expect(items[0].getText()).to.eventually.equal('Login');
      expect(items[1].getText()).to.eventually.equal('Signup');
    });
  });

  // it('should navigate to Login Page', function() {
  //   mainPage.navItem.then(function(items) {
  //     items[0].click();
  //     expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
  //   });
  // });

  it('should navigate to Signup Page', function() {
    mainPage.navItem.then(function(items) {
      items[1].click();
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/signup');
    });
  });

});
