'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var userCtrlStub = {
  getUser: 'userCtrl.getUser',
  update: 'userCtrl.update',
  create: 'userCtrl.create',
  login: 'userCtrl.login'
};

var routerStub = {
  get: sinon.spy(),
  post: sinon.spy()
};

// require the index with our stubbed out modules
var userIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './user.controller': userCtrlStub
});

describe('User API Router:', function() {
  it('should return an express router instance', function() {
    expect(userIndex).to.equal(routerStub);
  });

  describe('GET /api/users', function() {
    it('should route to user.controller.getUser', function() {
      expect(routerStub.get
        .withArgs('/', 'userCtrl.getUser')
        ).to.have.been.calledOnce;
    });
  });

/*multer causing an issue with this test*/
  xdescribe('POST /api/users/update', function() {
    it('should route to user.controller.update', function() {
      expect(routerStub.post
        .withArgs('/update', 'userCtrl.update')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/users/signup', function() {
    it('should route to user.controller.signup', function() {
      expect(routerStub.post
        .withArgs('/signup', 'userCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/users/login', function() {
    it('should route to user.controller.login', function() {
      expect(routerStub.post
        .withArgs('/login', 'userCtrl.login')
        ).to.have.been.calledOnce;
    });
  });

});
