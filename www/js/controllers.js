angular.module('app.controllers', [])

  .controller('cBidReportAppCtrl', function ($scope, mInitdata, sInitDataService) {
    if (!mInitdata.initial) {
      sInitDataService.initCommonDB();
      mInitdata.initial = true;
      sInitDataService.mockupDB();

    }
  })

  .controller('cScheduleVaccineTodayCtrl', function ($scope, sRuleHelper) {
    var rulesEffect = sRuleHelper.excuteRules();
    console.log("rulesEffect");
    console.log(rulesEffect);
    var programStageDataElementsMap = sRuleHelper.programStageDataElementsMap();

    // processRuleEffects
    for (var key in rulesEffect) {
      var effect = rulesEffect[key];
      if (effect.dataElement && effect.action == "HIDEFIELD" && effect.ineffect) {
        programStageDataElementsMap[rulesEffect[key].dataElement.id] = "hidden";
      }
    }

    for(var key in programStageDataElementsMap){
      var programStageDataElement=programStageDataElementsMap[key];
      if(programStageDataElement!="hidden"){
        console.log("key = " + key);
        console.log(programStageDataElement.dataElement.name);
      }
    }

  })

  .controller('cStockInHandCtrl', function ($scope) {

  })

  .controller('cStockInHandVsDemandCtrl', function ($scope) {

  })

  .controller('cVaccineHistoryReportCtrl', function ($scope) {

  })

  .controller('cLoginCtrl', function ($scope) {

  })
