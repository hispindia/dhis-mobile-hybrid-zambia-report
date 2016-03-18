/**
 * Created by nhancao on 3/18/16.
 */
angular.module('app.configs', [])
  .service('sConfigVariableApp', function (mInitdata, mCODE) {
    this.initDev=function(){
      mInitdata.environment = mCODE.EVN.DEV;
      mInitdata.initial = false;
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

