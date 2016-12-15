'use strict';

const LoginPage = function() {
  this.input = element.all(by.css('.borderless-input'));
  this.email = element(by.model('login.formData.email'));
  this.password = element(by.model('login.formData.password'));
  this.button = element(by.buttonText('Login'));
};

module.exports = new LoginPage();

