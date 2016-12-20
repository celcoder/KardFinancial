'use strict';

const Dashboard = function() {
  // this.inputbox = element(by.model('onboardcards.query'));
  // this.listOfCards = element.all(by.repeater('card in onboardcards.searchCards'));
  // this.addingCard = element.all(by.css('#signupWalletQueue'));
  // this.button = element(by.buttonText('Continue'));
  this.navItem = element.all(by.css('.nav-link'));
  this.input = element(by.model('dealsSearchText'));
  this.listOfCards = element.all(by.repeater('card in wallet.walletCards'));
  this.walletCards = element.all(by.repeater('card in wallet.searchCards'));
  this.addCard = element(by.css('[ng-click="wallet.addCardsButton()"]'));
  this.cardSearch = element(by.model('wallet.query'));
  this.doneAddingCard = element(by.css('[ng-click="wallet.addCompleted()"]'));
  this.editWallet = element(by.css('[ng-click="wallet.showRemoveOptions()"]'));
  this.removeCard = element.all(by.css('.remove-card-link'));
  this.saveWallet = element(by.css('[ng-click="wallet.removeSelectedCards()"]'));
  this.listDeals = element.all(by.repeater('deal in filteredDeals = (deals.lazyDeals | filter:dealsSearchText)'));
  this.logOut = element(by.css('[ng-click="setting.logout()"]'));
}

module.exports = new Dashboard();
