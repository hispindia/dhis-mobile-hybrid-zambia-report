angular.module('app.routes', [])

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('menu.login', {
        url: '/page-login',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-login.html',
            controller: 'cLogin'
          }
        }
      })

      .state('menu.bidReportApp', {
        url: '/page-home',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-bid-report-app.html',
            controller: 'cBidReportApp'
          }
        }
      })

      .state('menu.scheduleVaccineToday', {
        url: '/page-schedule-vaccine-today',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-schedule-vaccine-today.html',
            controller: 'cScheduleVaccineToday'
          }
        }
      })
      .state('menu.vaccineToday', {
        url: '/page-vaccine-today',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-vaccine-today.html',
            controller: 'cScheduleVaccineToday'
          }
        }
      })
      .state('menu.vaccineCompleted', {
        url: '/page-vaccine-completed',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-vaccine-completed.html',
            controller: 'cScheduleVaccineToday'
          }
        }
      })

      .state('menu.stockInHand', {
        url: '/page-stock-in-hand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-stock-in-hand.html',
            controller: 'cStockInHand'
          }
        }
      })

      .state('menu.stockInHandDemand', {
        url: '/page-stock-in-hand-demand',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-stock-in-hand-demand.html',
            controller: 'cStockInHandVsDemand'
          }
        }
      })

      .state('menu.vaccineHistoryReport', {
        url: '/page-vaccine-history-report',
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
        url: '/page-about',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-about.html',
          }
        }
      })

      //Define test console
      .state('menu.console', {
        url: '/page-console',
        views: {
          'side-menu21': {
            templateUrl: 'templates/page-console.html',
            controller: 'cConsole'
          }
        }
      })


    ;

    $urlRouterProvider.otherwise('/side-menu21/page-login');


  });
