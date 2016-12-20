'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var passwordCtrlStub = {
  reset: 'passwordCtrl.reset',
  recover: 'passwordCtrl.recover'
  // index: 'passwordCtrl.index',
  // show: 'passwordCtrl.show',
  // create: 'passwordCtrl.create',
  // upsert: 'passwordCtrl.upsert',
  // patch: 'passwordCtrl.patch',
  // destroy: 'passwordCtrl.destroy'
};

var routerStub = {
  post: sinon.spy()
  // get: sinon.spy(),
  // put: sinon.spy(),
  // patch: sinon.spy(),
  // delete: sinon.spy()
};

// require the index with our stubbed out modules
var passwordIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './password.controller': passwordCtrlStub
});

describe('Password API Router:', function() {
  it('should return an express router instance', function() {
    expect(passwordIndex).to.equal(routerStub);
  });

  describe('POST /api/passwords/reset', function() {
    it('should route to password.controller.reset', function() {
      expect(routerStub.post
        .withArgs('/reset', 'passwordCtrl.reset')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/passwords/recover', function() {
    it('should route to password.controller.recover', function() {
      expect(routerStub.post
        .withArgs('/recover', 'passwordCtrl.recover')
        ).to.have.been.calledOnce;
    });
  });

  // describe('GET /api/passwords', function() {
  //   it('should route to password.controller.index', function() {
  //     expect(routerStub.get
  //       .withArgs('/', 'passwordCtrl.index')
  //       ).to.have.been.calledOnce;
  //   });
  // });

  // describe('GET /api/passwords/:id', function() {
  //   it('should route to password.controller.show', function() {
  //     expect(routerStub.get
  //       .withArgs('/:id', 'passwordCtrl.show')
  //       ).to.have.been.calledOnce;
  //   });
  // });

  // describe('POST /api/passwords', function() {
  //   it('should route to password.controller.create', function() {
  //     expect(routerStub.post
  //       .withArgs('/', 'passwordCtrl.create')
  //       ).to.have.been.calledOnce;
  //   });
  // });

  // describe('PUT /api/passwords/:id', function() {
  //   it('should route to password.controller.upsert', function() {
  //     expect(routerStub.put
  //       .withArgs('/:id', 'passwordCtrl.upsert')
  //       ).to.have.been.calledOnce;
  //   });
  // });

  // describe('PATCH /api/passwords/:id', function() {
  //   it('should route to password.controller.patch', function() {
  //     expect(routerStub.patch
  //       .withArgs('/:id', 'passwordCtrl.patch')
  //       ).to.have.been.calledOnce;
  //   });
  // });

  // describe('DELETE /api/passwords/:id', function() {
  //   it('should route to password.controller.destroy', function() {
  //     expect(routerStub.delete
  //       .withArgs('/:id', 'passwordCtrl.destroy')
  //       ).to.have.been.calledOnce;
  //   });
  // });
});
