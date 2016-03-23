angular.module('app.filters', [])

  /**
   * filter will split event list to scheduled today and vaccine completed
   * norm: 0 for scheduled today
   * norm: 1 for vaccine completed
   */
  .filter('fEventListFilter', function (mDataCommon, sUtils) {
    var dataElements = mDataCommon.dataElements;
    var dataElementsLength = sUtils.countObjectLength(dataElements);
    return function (arr, norm) {
      if (norm != 0 && norm != 1) return arr;
      var filtered = [];
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var countHiddenItem = 0;
        for (var key in item) {
          if (dataElements.hasOwnProperty(key) && ((norm == 0 && item[key] != "+") || (norm == 1 && item[key] == "+"))) {
            item[key] = "-";
          }
          if (item[key] == "-") {
            countHiddenItem++;
          }
        }
        if (countHiddenItem < dataElementsLength) {
          filtered.push(item);
        }
      }
      return filtered;
    };
  })

  /**
   * filter will replace specific character '+' to calendar icon and '-' to done icon
   */
  .filter('fEventDecoratorFilter', function () {
    return function (item) {
      if (item == "+") {
        return '<i class="icon ion-android-calendar"></i>'
      } else if (item != "-") {
        return '<i class="icon ion-android-done"></i>'
      }
      return item;
    };
  })
  .filter('blankFilter', function () {

  })


;

