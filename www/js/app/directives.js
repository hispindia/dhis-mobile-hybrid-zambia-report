angular.module('app.directives', [])

  .directive('scheduleEvent', function () {
    return {
      restrict: 'EA',
      templateUrl: 'templates/item-views/item_event_report.html'
    };
  })

  .directive('blankDirective', [function () {

  }])

;

