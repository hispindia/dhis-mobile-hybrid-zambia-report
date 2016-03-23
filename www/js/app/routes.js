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
            templateUrl: 'templates/page-login.html',
            controller: 'cLogin'
          }
        }
      })

      .state('menu.bidReportApp', {
        url: '/page_home',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-bid-report-app.html',
            controller: 'cBidReportApp'
          }
        }
      })

      .state('menu.scheduleVaccineToday', {
        url: '/page_schedule_vaccine_today',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-schedule-vaccine-today.html',
            controller: 'cScheduleVaccineToday'
          }
        }
      })

      .state('menu.stockInHand', {
        url: '/page_stock_in_hand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-stock-in-hand.html',
            controller: 'cStockInHand'
          }
        }
      })

      .state('menu.stockInHandVsDemand', {
        url: '/page_stock_in_hand_vs_demand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-stock-in-hand-demand.html',
            controller: 'cStockInHandVsDemand'
          }
        }
      })

      .state('menu.vaccineHistoryReport', {
        url: '/page_vaccine_history_report',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-vaccine-history-report.html',
            controller: 'cVaccineHistoryReport'
          }
        }
      })

      .state('menu', {
        url: '/side-menu21',
        templateUrl: 'templates/page-menu.html',
        controller: 'cMenu',
        abstract: true
      })

      .state('menu.about', {
        url: '/page_about',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-about.html',
          }
        }
      })

      //Define test console
      .state('menu.console', {
        url: '/page_console',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-console.html',
            controller: 'cConsole'
          }
        }
      })


    ;

    $urlRouterProvider.otherwise('/side-menu21/page_login');


  });
