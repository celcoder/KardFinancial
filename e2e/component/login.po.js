'use strict';

const LoginPage = function() {
  this.input = element.all(by.css('.borderless-input'));
  this.email = element(by.model('login.formData.email'));
  this.password = element(by.model('login.formData.password'));
  this.button = element(by.buttonText('Login'));
  this.loginUser = {
    _id: '5858218eb3fa6c17ce930af3',
    email: 'servertesting@gmail.com',
    password: 'testing123'
  };
  this.placeholder = {
    text: 'placeholder',
    email: 'Email address',
    password: 'Password',
  };
  this.loginUserNoCard = {
    _id: '585829e90f5e731cfbdcf750',
    email: 'loginwithoutcard@gmail.com',
    password: 'password'
  }
};

module.exports = new LoginPage();

