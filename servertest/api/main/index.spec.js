'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mainCtrlStub = {
  get: 'mainCtrl.get'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var mainIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './main.controller': mainCtrlStub
});

describe('Main API Router:', function() {
  it('should return an express router instance', function() {
    expect(mainIndex).to.equal(routerStub);
  });

  describe('GET /api', function() {
    it('should route to main.controller.get', function() {
      expect(routerStub.get
        .withArgs('/', 'mainCtrl.get')
        ).to.have.been.calledOnce;
    });
  });
});
