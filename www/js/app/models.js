/**
 * Created by nhancao on 3/16/16.
 */
angular.module('app.models', [])
  .constant("mCODE", {
    EVN: {
      DEV: 0,
      STAGING: 1,
      PRODUCTION: 2
    },
    STORAGE: {
      AUTHEN: "authentication",
      URL: "url",
      ORGUID:"organisationUnitUID"
    },
    MSG: {
      ISLOGIN: "isLogin",
      ISLOGOUT: "isLogout",
      EVENTDETAILS: "eventDetails"
    }
  })
  .constant("mInitdata", {
    environment: undefined,
    initial: undefined,
    programUID: "SSLpOM0r1U7",
    programStageUID: "s53RFfXA75f",
    ouMode:"SELECTED",
    eventStatus: "SCHEDULE"
  })
  .constant("mDataCommon", {
    constants: undefined,
    programIndicators: undefined,
    programValidations: undefined,
    programRuleVariables: undefined,
    programRules: undefined,
    programStageDataElements: undefined,
    programTrackedEntityAttributes: undefined,
    events: undefined,
    eventDetails: []
  })
  .constant("mEventData", {
    trackedEntityInstances: undefined,
    enrollments: undefined,
    eventTEI: undefined
  });
