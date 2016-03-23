angular.module('app.directives', [])

  .directive('scheduleEvent', function () {
    return {
      restrict: 'EA',
      templateUrl: 'templates/item-views/item-event-report.html'
    };
  })

  .directive('blankDirective', [function () {

  }])

;

