/**
 * Created by nhancao on 3/16/16.
 */
angular.module('app.models', [])
  .constant("mInitdata",{
    initial:false
  })
  .constant("mDataCommon",{
    constants:"",
    programIndicators:"",
    programValidations:"",
    programRuleVariables:"",
    programRules:"",
    programStageDataElements:"",
    programTrackedEntityAttributes:"",
    events:""
  })
  .constant("mEventData",{
    trackedEntityInstances:"",
    enrollments:"",
    eventsTEI:""
  });
