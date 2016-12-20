'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var offersCtrlStub = {
  get: 'offersCtrl.get'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var offersIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './offers.controller': offersCtrlStub
});

describe('Offers API Router:', function() {
  it('should return an express router instance', function() {
    expect(offersIndex).to.equal(routerStub);
  });

  describe('GET /api/offers/:id', function() {
    it('should route to offers.controller.get', function() {
      expect(routerStub.get
        .withArgs('/:id', 'offersCtrl.get')
        ).to.have.been.calledOnce;
    });
  });
});
