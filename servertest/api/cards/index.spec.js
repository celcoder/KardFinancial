'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var cardsCtrlStub = {
  search: 'cardsCtrl.search',
  getCard: 'cardsCtrl.getCard'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var cardsIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './cards.controller': cardsCtrlStub
});

describe('Cards API Router:', function() {
  it('should return an express router instance', function() {
    expect(cardsIndex).to.equal(routerStub);
  });

  describe('GET /api/cards/search', function() {
    it('should route to password.controller.search', function() {
      expect(routerStub.get
        .withArgs('/search', 'cardsCtrl.search')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/cards/getCard', function() {
    it('should route to password.controller.getCard', function() {
      expect(routerStub.get
        .withArgs('/getCard', 'cardsCtrl.getCard')
        ).to.have.been.calledOnce;
    });
  });

});
