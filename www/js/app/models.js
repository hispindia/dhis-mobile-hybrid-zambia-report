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
      AUTHEN: "authentication_key",
      URL: "url_key",
      ORGUID: "organisationUnitUID_key",
      DBNAME: "event_reports_key",

      INITIAL: "initial_key",
      INITIALDETAILS: "initialDetails_key",
      COMMONEXPIRE: "commonExpire_key",
      COMMONTIME: "commonTime_key",
      DETAILSEXPIRE: "detailsExpire_key",
      DETAILSTIME: "detailsTime_key",
      GETCONSTANTS: "getConstants_key",
      GETPROGRAMTRACKEDENTITYATTRIBUTES: "getProgramTrackedEntityAttributes_key",
      GETPROGRAMSTAGEDATAELEMENTS: "getProgramStageDataElements_key",
      GETPROGRAMINDICATORS: "getProgramIndicators_key",
      GETPROGRAMVALIDATIONS: "getProgramValidations_key",
      GETPROGRAMRULEVARIABLES: "getProgramRuleVariables_key",
      GETPROGRAMRULES: "getProgramRules_key",
      GETEVENTS: "getEvents_key"

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

  /*Unit table
   years	y
   quarters	Q
   months	M
   weeks	w
   days	d
   hours	h
   minutes	m
   seconds	s
   milliseconds	ms*/
  .constant("mInitdata", {
    evn_setup: 0, //dev environment
    environment: undefined,
    programUID: "SSLpOM0r1U7",
    programStageUID: "s53RFfXA75f",
    ouMode: "SELECTED",
    eventStatus: "SCHEDULE",
    commonExpire: 1,
    commonExpireUnit: "minutes",
    detailsExpire: 1,
    detailsExpireUnit: "minutes",

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
    eventCacheReports: []
  })
  .constant("mEventData", {
    trackedEntityInstances: undefined,
    enrollments: undefined,
    eventTEI: undefined
  })
  .constant("mEventDetails", {
    eventId: "-",
    dueDate: "-",
    sB1IHYu2xQT: "-",
    wbtl3uN0spv: "-",
    rKtHjgcO2Bn: "-",

    bpBUOvqy1Jn: "-",
    EMcT5j5zR81: "-",
    KRF40x6EILp: "-",
    no7SkAxepi7: "-",
    CfPM8lsEMzH: "-",
    K3TcJM1ySQA: "-",
    fmXCCPENnwR: "-",
    nIqQYeSwU9E: "-",
    sDORmAKh32v: "-",
    PvHUllrtPiy: "-",
    wYg2gOWSyJG: "-",
    nQeUfqPjK5o: "-",
    pxCZNoqDVJC: "-",
    B4eJCy6LFLZ: "-",
    cNA9EmFaiAa: "-",
    g8dMiUOTFla: "-",
    Bxh1xgIY9nA: "-"
  })


;
