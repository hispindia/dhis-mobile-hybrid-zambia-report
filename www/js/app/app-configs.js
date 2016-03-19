/**
 * Created by nhancao on 3/18/16.
 */
angular.module('app.configs', [])

  .service('sInitApp', function ($http, $rootScope, localStorageService, mInitdata, mCODE, sInitDataService, sConfigVariableApp) {
    var login = {
      host: undefined,
      authen: undefined
    };

    this.populateData = function () {
      if (angular.isUndefined(mInitdata.initial)) {
        sConfigVariableApp.initApp(mCODE.EVN.STAGING);
        sInitDataService.initCommonDB();
        mInitdata.initial = true;
        sInitDataService.mockupDB();
      }
    };
    /**
     * Check had login or not
     * @param broadcast Send broadcast message mCODE.MSG.ISLOGIN if had login or mCODE.MSG.ISLOGOUT otherwise
     * @returns {boolean}
       */
    this.isLogin = function (broadcast) {
      login.host = localStorageService.get(mCODE.STORAGE.URL);
      login.authen = localStorageService.get(mCODE.STORAGE.AUTHEN);
      if (validateStr(login.host) && validateStr(login.authen)) {
        if (broadcast) {
          mInitdata.host = login.host;
          $http.defaults.headers.common.Authorization = login.authen;
          this.populateData();
          $rootScope.$broadcast(mCODE.MSG.ISLOGIN);
        }
        return true;
      }
      if (broadcast) {
        $rootScope.$broadcast(mCODE.MSG.ISLOGOUT);
      }
      return false;
    };

    this.login = function (host, username, password) {
      if (validateStr(host) && validateStr(username) && validateStr(password)) {
        localStorageService.set(mCODE.STORAGE.AUTHEN, "Basic " + btoa(username + ":" + password));
        localStorageService.set(mCODE.STORAGE.URL, host);
        $rootScope.$broadcast(mCODE.MSG.ISLOGIN);
      }
    };

    this.logout = function () {
      localStorageService.clearAll();
      $rootScope.$broadcast(mCODE.MSG.ISLOGOUT);
    };

    this.getLogin = function () {
      if (this.isLogin()) {
        return login;
      }
      return null;
    };

    function validateStr(str) {
      if (str == null || str == undefined || str == '') {
        return false;
      }
      return true;
    }

  })

  .service('sConfigVariableApp', function (mInitdata, mCODE) {
    this.initApp = function (evironment) {
      mInitdata.environment = evironment;
      mInitdata.initial = false;
    };
    this.isDEV = function () {
      return (mInitdata.environment == mCODE.EVN.DEV);
    };
    this.isSTAGING = function () {
      return (mInitdata.environment == mCODE.EVN.STAGING);
    };
    this.isPRODUCTION = function () {
      return (mInitdata.environment == mCODE.EVN.PRODUCTION);
    }
  })

  .service('sLog', function ($log, mInitdata, mCODE) {
    this.warn = function (msg) {
      if (mInitdata.environment == mCODE.EVN.DEV) {
        $log.warn(msg);
      }
    };
    this.info = function (msg) {
      if (mInitdata.environment == mCODE.EVN.DEV) {
        $log.info(msg);
      }
    }
  });

