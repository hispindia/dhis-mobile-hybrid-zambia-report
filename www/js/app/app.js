// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngSanitize', 'indexedDB',
    'app.models',
    'app.controllers',
    'app.routes',
    'app.services',
    'app.directives',
    'app.configs',
    'app.filters',
    'dhis2.compress',
    'pascalprecht.translate',
    'LocalStorageModule'
  ])
  .config(function ($indexedDBProvider, mCODE) {
    $indexedDBProvider
      .connection('hiIndexedDB')
      .upgradeDatabase(1, function (event, db, tx) {
        var objStore = db.createObjectStore(mCODE.STORAGE.DBNAME, {keyPath: 'eventId'});
        //objStore.createIndex('dueDate_idx', 'dueDate', {unique: false});
      });
  })
  .config(function (localStorageServiceProvider) {
    //https://github.com/grevory/angular-local-storage
    localStorageServiceProvider
      .setPrefix('hi')
      .setStorageType('localStorage')

  })
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .run(function ($ionicHistory, $state, $rootScope, $location, mDataCommon, mCODE, sUtils, sAuthentication, sInitDataService) {
    $rootScope.$on(mCODE.MSG.ISLOGIN, function () {
      if ($location.path() == "/side-menu21/page_login") {
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('menu.bidReportApp');
      }
    });
    $rootScope.$on(mCODE.MSG.ISLOGOUT, function () {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('menu.login');
    });
    $rootScope.$on(mCODE.MSG.EVENTDETAILS, function (event, args) {
      var eventInfo = args.evenInfo;
      mDataCommon.eventCacheReports.push(eventInfo);
      sUtils.openStore(function (store) {
        store.upsert({
          "eventId": eventInfo.eventId,
          "dueDate": eventInfo.dueDate,
          "sB1IHYu2xQT": eventInfo.sB1IHYu2xQT,
          "wbtl3uN0spv": eventInfo.wbtl3uN0spv,
          "rKtHjgcO2Bn": eventInfo.rKtHjgcO2Bn,

          "bpBUOvqy1Jn": eventInfo.bpBUOvqy1Jn,
          "EMcT5j5zR81": eventInfo.EMcT5j5zR81,
          "KRF40x6EILp": eventInfo.KRF40x6EILp,
          "no7SkAxepi7": eventInfo.no7SkAxepi7,
          "CfPM8lsEMzH": eventInfo.CfPM8lsEMzH,
          "K3TcJM1ySQA": eventInfo.K3TcJM1ySQA,
          "fmXCCPENnwR": eventInfo.fmXCCPENnwR,
          "nIqQYeSwU9E": eventInfo.nIqQYeSwU9E,
          "sDORmAKh32v": eventInfo.sDORmAKh32v,
          "PvHUllrtPiy": eventInfo.PvHUllrtPiy,
          "wYg2gOWSyJG": eventInfo.wYg2gOWSyJG,
          "nQeUfqPjK5o": eventInfo.nQeUfqPjK5o,
          "pxCZNoqDVJC": eventInfo.pxCZNoqDVJC,
          "B4eJCy6LFLZ": eventInfo.B4eJCy6LFLZ,
          "cNA9EmFaiAa": eventInfo.cNA9EmFaiAa,
          "g8dMiUOTFla": eventInfo.g8dMiUOTFla,
          "Bxh1xgIY9nA": eventInfo.Bxh1xgIY9nA
        });
        if (mDataCommon.eventCacheReports.length == 1 ||
          (mDataCommon.eventCacheReports.length >= (mDataCommon.events.length / 2)) ||
          (mDataCommon.eventCacheReports.length >= (mDataCommon.events.length))) {
          $rootScope.$broadcast(mCODE.MSG.EVENTRENDER);
        }
        if (mDataCommon.eventCacheReports.length >= (mDataCommon.events.length)) {
          sInitDataService.updateDetailExpire();
        }
      });


    });

    if (sAuthentication.isLogin(true)) {
      sInitDataService.populateData();
    }

  })


;
