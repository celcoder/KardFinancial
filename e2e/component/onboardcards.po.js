'use strict';

const OnboardCards = function() {
  this.inputbox = element(by.model('onboardcards.query'));
  this.listOfCards = element.all(by.repeater('card in onboardcards.searchCards'));
  this.addingCard = element.all(by.css('#signupWalletQueue'));
  this.button = element(by.buttonText('Continue'));
}

module.exports = new OnboardCards();
