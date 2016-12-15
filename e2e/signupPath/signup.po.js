'use strict';

const SignUpPage = function() {
  this.input = element.all(by.css('.borderless-input'));
  this.email = element(by.model('signup.formData.email'));
  this.password = element(by.model('signup.formData.password'));
  this.passwordConfirmation = element(by.model('signup.formData.passwordConfirmation'));
  this.button = element(by.buttonText('Sign up'))
};

module.exports = new SignUpPage();

