'use strict';

const OnboardExt = function() {
  this.text = element(by.css('.extension-message'));
  this.message = 'Install our extension to receive deals in realtime while you shop online.';
  this.installButton = element(by.css('#installExtensionButton'));
  this.skipButton = element(by.css('#skipForNowButton'));
};

module.exports = new OnboardExt();
