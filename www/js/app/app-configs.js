/**
 * Created by nhancao on 3/18/16.
 */
angular.module('app.configs', [])

  .service('sConfigVariableApp', function (mInitdata, mCODE) {
    this.initApp = function (evironment) {
      mInitdata.environment = evironment;
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

