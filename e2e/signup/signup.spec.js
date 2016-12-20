'use strict';

const config = browser.params;

xdescribe('Kard SignUp Path', function() {

  describe('Kard Signup View', function() {
    let signUpPage;

    it('should navigate to Signup page URL', function() {
      let promise = browser.get(config.baseUrl + '/signup');
      signUpPage = require('../component/signup.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/signup');
    });

    it('should display 3 Input fields', function() {
      signUpPage.input.then(function(items) {
        expect(items.length).to.equal(3);
        expect(items[0].getAttribute(signUpPage.placeholder.text)).to.eventually.equal(signUpPage.placeholder.email);
        expect(items[1].getAttribute(signUpPage.placeholder.text)).to.eventually.equal(signUpPage.placeholder.password);
        expect(items[2].getAttribute(signUpPage.placeholder.text)).to.eventually.equal(signUpPage.placeholder.repassword);
      });
    });

    it('should create a new account for a newUser', function() {
      signUpPage.email.sendKeys(signUpPage.newUser.email);
      signUpPage.password.sendKeys(signUpPage.newUser.password);
      signUpPage.passwordConfirmation.sendKeys(signUpPage.newUser.repassword);
      signUpPage.button.click();
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
        expect(localStorageUser.email).to.equal(signUpPage.newUser.email);
      });
    });

  });

  describe('Kard Onboard Cards View', function() {
    let onboardCard;

    it('should navigate to OnboardCard page URL', function() {
      let promise = browser.get(config.baseUrl + '/onboard/cards');
      onboardCard = require('../component/onboardcards.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/onboard/cards');
    });

    it('should display One Input field', function() {
      expect(onboardCard.inputbox.getAttribute('placeholder')).to.eventually.equal('Search for a card');
    });

    it('should display the List of cards', function() {
      onboardCard.inputbox.sendKeys('chase', protractor.Key.ENTER);
      onboardCard.listOfCards.then(function(cards) {
        expect(cards[0].getText()).to.eventually.equal('Chase Freedom®');
      });
    });

    it('should clear the input box when clicked', function() {
      onboardCard.inputbox.click();
      expect(onboardCard.inputbox.getText()).to.eventually.equal('');
    });

    it('should add the choice of card to the wallet', function() {
      onboardCard.inputbox.sendKeys('citi', protractor.Key.ENTER);
      onboardCard.listOfCards.then(function(cards) {
        expect(cards[0].getText()).to.eventually.equal('Citi Prestige® Card');
        cards[0].click();
        onboardCard.button.click();
        expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/onboard/extension');
      });
    });
  });

  describe('Kard Onboard Extension View', function() {
    let onboardExt;

    it('should navigate to the Onboard Extension Url', function() {
      let promise = browser.get(config.baseUrl + '/onboard/extension');
      onboardExt = require('../component/onboardext.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/onboard/extension');
    });

    it('should show text message Install our extension', function() {
      expect(onboardExt.text.getText()).to.eventually.equal(onboardExt.message);
    });

    it('should show a button to Install our extension', function() {
      expect(onboardExt.installButton.getText()).to.eventually.equal('Install Kard');
    });

    it('should show a button to Skip our extension', function() {
      expect(onboardExt.skipButton.getText()).to.eventually.equal('Skip for now');
    });

    it('should be able to skip the process of downloading extension', function() {
      onboardExt.skipButton.click();
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
    });

  });

  describe('Kard Dashboard View', function() {
    let dashboard;

    it('should navigate to the Dashboard Deals Url', function() {
      let promise = browser.get(config.baseUrl + '/dashboard/deals');
      dashboard = require('../component/dashboard.po');
      return promise;
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
    });

    it('should display Tab-Bar with 2 items', function() {
      dashboard.navItem.then(function(items) {
        expect(items[2].getText()).to.eventually.equal('Deals');
        expect(items[3].getText()).to.eventually.equal('Wallet');
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

    it('should display One search bar', function() {
      expect(dashboard.input).to.exist;
      expect(dashboard.input.getAttribute('placeholder')).to.eventually.equal('Search for deals');
    });

    it('should be able to search for a particular deal', function() {
      dashboard.input.sendKeys('apple');
      dashboard.listDeals.then(function(deals) {
        expect(deals.length).to.equal(1);
        expect(deals[0].getText()).to.eventually.match(/Apple/);
      });
    });

    it('should display correct Url when wallet tab is clicked', function() {
      dashboard.navItem.then(function(items) {
        items[3].click();
      });
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/wallet');
    });

    it('should display cards in the wallet', function() {
      dashboard.listOfCards.then(function(cards) {
        expect(cards[0].getText()).to.eventually.match(/Citi Prestige®/);
      });
    });

    it('should add additional cards in the wallet', function() {
      expect(dashboard.addCard.getText()).to.eventually.equal('Add another card');
      dashboard.addCard.click();
      expect(dashboard.cardSearch.getAttribute('placeholder')).to.eventually.equal('Type a card name');
      dashboard.cardSearch.sendKeys('chase', protractor.Key.ENTER);
      dashboard.walletCards.then(function(cards) {
        expect(cards[2].getText()).to.eventually.equal('Chase Sapphire® Card');
        expect(cards[4].getText()).to.eventually.equal('Chase Freedom Unlimited');
        cards[2].click();
        dashboard.doneAddingCard.click();
      });
    });

    it('should display 2 cards on current wallet', function() {
      dashboard.listOfCards.then(function(cards) {
        expect(cards.length).to.equal(2);
        expect(cards[0].getText()).to.eventually.match(/Citi Prestige®/);
        expect(cards[1].getText()).to.eventually.match(/Chase Sapphire® Card/);
      });
    });

    it('should remove card from wallet and display only 1 Card', function() {
      dashboard.editWallet.click();
      dashboard.removeCard.then(function(cards) {
        cards[0].click();
        dashboard.saveWallet.click();
      });
      dashboard.listOfCards.then(function(cards) {
        expect(cards.length).to.equal(1);
        expect(cards[0].getText()).to.eventually.match(/Chase Sapphire® Card/);
      });
    });

    it('should display correct Url when deals tab is clicked', function() {
      dashboard.navItem.then(function(items) {
        items[2].click();
      });
      expect(browser.getCurrentUrl()).to.eventually.equal('http://localhost:9000/dashboard/deals');
    });

  });

});
