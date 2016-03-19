// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'angular-loading-bar', 'ngAnimate',
    'app.models',
    'app.controllers',
    'app.routes',
    'app.services',
    'app.directives',
    'app.configs',
    'dhis2.compress',
    'pascalprecht.translate',
    'LocalStorageModule'
  ])
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
  .config(function (localStorageServiceProvider) {
    //https://github.com/grevory/angular-local-storage
    localStorageServiceProvider
      .setPrefix('hi')
      .setStorageType('localStorage')
      .setStorageCookie(45, '/');

  })
  .config(function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    //cfpLoadingBarProvider.spinnerTemplate = '<div></div>';
    //cfpLoadingBarProvider.barTemplate = '<div></div>';
  })

  .run(function ($ionicHistory, $state, $rootScope, $location, mCODE, sInitApp) {
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
    sInitApp.isLogin(true);
  })


;
