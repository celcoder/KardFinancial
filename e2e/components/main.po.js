/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

const MainPage = function() {
  this.navItem = element.all(by.css('.nav-item'));
  // this.h1El = this.heroEl.element(by.css('h1'));
  // this.imgEl = this.heroEl.element(by.css('img'));
};

module.exports = new MainPage();

