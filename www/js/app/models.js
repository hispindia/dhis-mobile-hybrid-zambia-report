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
      EVENTDETAILS: "eventDetails",
      EVENTRENDER: "eventRender",
      UPDATECOMMONDB: "commonDbComplete",
      APIERROR: "apiCallError"
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
    constants: [],
    programIndicators: [],
    programValidations: [],
    programRuleVariables: [],
    programRules: [],
    programStageDataElements: [],
    programTrackedEntityAttributes: [],
    events: [],
    eventDetails: [],
    eventCacheReports: []
  })
  .constant("mEventData", {
    trackedEntityInstances: undefined,
    enrollments: undefined,
    eventTEI: undefined
  })
  .constant("mEventDetails", {
    eventId:"-",
    dueDate:"-",
    sB1IHYu2xQT:"-",
    wbtl3uN0spv:"-",
    age:"-",

    bpBUOvqy1Jn:"-",
    EMcT5j5zR81:"-",
    KRF40x6EILp:"-",
    no7SkAxepi7:"-",
    CfPM8lsEMzH:"-",
    K3TcJM1ySQA:"-",
    fmXCCPENnwR:"-",
    nIqQYeSwU9E:"-",
    sDORmAKh32v:"-",
    PvHUllrtPiy:"-",
    wYg2gOWSyJG:"-",
    nQeUfqPjK5o:"-",
    pxCZNoqDVJC:"-",
    B4eJCy6LFLZ:"-",
    cNA9EmFaiAa:"-",
    g8dMiUOTFla:"-",
    Bxh1xgIY9nA:"-"
  })




;
