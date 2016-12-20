'use strict';

const config = browser.params;

xdescribe('Kard Login Path', function() {

  describe('Kard Login View', function() {
    let loginPage;

    it('should navigate to Login page URL', function() {
      let promise = browser.get(config.baseUrl + '/login');
      loginPage = require('../component/login.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
    });

    it('should display 2 Input fields', function() {
      loginPage.input.then(function(items) {
        expect(items.length).to.equal(2);
        expect(items[0].getAttribute(loginPage.placeholder.text)).to.eventually.equal(loginPage.placeholder.email);
        expect(items[1].getAttribute(loginPage.placeholder.text)).to.eventually.equal(loginPage.placeholder.password);
      });
    });

    it('should be able to login as an existing user', function() {
      loginPage.email.sendKeys(loginPage.loginUser.email);
      loginPage.password.sendKeys(loginPage.loginUser.password);
      loginPage.button.click();
    });

    it('should navigate to the Dashboard Deals Url', function() {
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
    });

    it('should create a localStorage item as User logged-in', function() {
      let localStorageUser;
      browser.executeScript("return window.localStorage.getItem('user');").then(user => {
        localStorageUser = JSON.parse(user);
        expect(localStorageUser).to.exist;
        expect(localStorageUser).to.be.instanceOf(Object);
        expect(localStorageUser).to.have.any.keys(['_id', 'email', 'token']);
        expect(localStorageUser._id).to.equal(loginPage.loginUser._id);
        expect(localStorageUser.email).to.equal(loginPage.loginUser.email);
      });
    });

    it('should create a new token for localStorage', function() {
      browser.executeScript("return window.localStorage.getItem('token');").then(token => {
        expect(token).to.exist;
        expect(token).to.be.string;
      });
    });

  });

  describe('Kard Dashboard View', function() {
    let dashboard;

    it('should navigate to Dashboard page URL', function() {
      let promise = browser.get(config.baseUrl + '/dashboard/deals');
      dashboard = require('../component/dashboard.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
    });

    it('should display Nav-Bar with 2 items', function() {
      dashboard.navItem.then(function(items) {
        expect(items.length).to.equal(4);
        expect(items[0].getText()).to.eventually.equal('Home');
        expect(items[1].getText()).to.eventually.equal('Settings');
      });
    });

    it('should display all the deals Available', function() {
      dashboard.navItem.then(function(items) {
        items[2].click();
        expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
      });
      dashboard.listDeals.then(function(deals) {
        expect(deals[2].getText()).to.eventually.match(/AT&T Wireless/);
        expect(deals[4].getText()).to.eventually.match(/AHAVA/);
        expect(deals[8].getText()).to.eventually.match(/AVON/);
      });
    });

    it('should go to portal url when deal is clicked', function() {
      dashboard.listDeals.then(function(deals) {
        expect(deals[2].getText()).to.eventually.match(/Shop deal/);
        deals[2].element(by.buttonText('Shop deal')).click();
        //method to open new tab and switch back to old tab in testing mode.
        browser.getAllWindowHandles().then(function(handles) {
            let prevWindowHandle = handles[0];
            let newWindowHandle = handles[1]; // this is your new window
            browser.switchTo().window(newWindowHandle).then(function() {
              expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/portal');
            });
            browser.switchTo().window(prevWindowHandle).then(function() {
              expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
            });
        });
      });
    });

    it('should display settings page when clicked', function() {
      dashboard.navItem.then(function(items) {
        items[1].click();
        expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/setting/account');
      });
    });

    it('should be able to logout of the Kard site', function() {
      expect(dashboard.logOut.getText()).to.eventually.equal('Logout');
      dashboard.logOut.click();
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
    });

  });

  describe('Kard Login Without Card', function() {
    let loginPage;

    it('should navigate to Login page URL', function() {
      let promise = browser.get(config.baseUrl + '/login');
      loginPage = require('../component/login.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/login');
    });

    it('should be able to login as an existing user without Card', function() {
      loginPage.email.sendKeys(loginPage.loginUserNoCard.email);
      loginPage.password.sendKeys(loginPage.loginUserNoCard.password);
      loginPage.button.click();
    });

    it('should display Onboard View since user is logged in without a Card', function() {
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/onboard/cards');
    });

  });

});
