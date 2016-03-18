/**
 * Created by nhancao on 3/16/16.
 */
angular.module('app.models', [])
  .constant("mCODE", {
    EVN: {
      DEV: 0,
      STAGING: 1,
      PRODUCTION: 2
    }
  })
  .constant("mInitdata", {
    environment: undefined,
    initial: undefined
  })
  .constant("mDataCommon", {
    constants: undefined,
    programIndicators: undefined,
    programValidations: undefined,
    programRuleVariables: undefined,
    programRules: undefined,
    programStageDataElements: undefined,
    programTrackedEntityAttributes: undefined,
    events: undefined
  })
  .constant("mEventData", {
    trackedEntityInstances: undefined,
    enrollments: undefined,
    eventsTEI: undefined
  });
