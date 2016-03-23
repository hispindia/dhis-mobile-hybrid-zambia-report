angular.module('app.routes', [])

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('menu.login', {
        url: '/page_login',
        views: {
          'side-menu21': {
            templateUrl: 'templates/login.html',
            controller: 'cLogin'
          }
        }
      })

      .state('menu.bidReportApp', {
        url: '/page_home',
        views: {
          'side-menu21': {
            templateUrl: 'templates/bidReportApp.html',
            controller: 'cBidReportApp'
          }
        }
      })

      .state('menu.scheduleVaccineToday', {
        url: '/page_schedule_vaccine_today',
        views: {
          'side-menu21': {
            templateUrl: 'templates/scheduleVaccineToday.html',
            controller: 'cScheduleVaccineToday'
          }
        }
      })

      .state('menu.stockInHand', {
        url: '/page_stock_in_hand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/stockInHand.html',
            controller: 'cStockInHand'
          }
        }
      })

      .state('menu.stockInHandVsDemand', {
        url: '/page_stock_in_hand_vs_demand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/stockInHandVsDemand.html',
            controller: 'cStockInHandVsDemand'
          }
        }
      })

      .state('menu.vaccineHistoryReport', {
        url: '/page_vaccine_history_report',
        views: {
          'side-menu21': {
            templateUrl: 'templates/vaccineHistoryReport.html',
            controller: 'cVaccineHistoryReport'
          }
        }
      })

      .state('menu', {
        url: '/side-menu21',
        templateUrl: 'templates/menu.html',
        controller: 'cMenu',
        abstract: true
      })

      .state('menu.about', {
        url: '/page_about',
        views: {
          'side-menu21': {
            templateUrl: 'templates/about.html',
          }
        }
      })

      //Define test console
      .state('menu.console', {
        url: '/page_console',
        views: {
          'side-menu21': {
            templateUrl: 'templates/console.html',
            controller: 'cConsole'
          }
        }
      })


    ;

    $urlRouterProvider.otherwise('/side-menu21/page_login');


  });
