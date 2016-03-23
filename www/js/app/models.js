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
    commonExpire: 3,
    commonExpireUnit: "days",
    detailsExpire: 1,
    detailsExpireUnit: "days",

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
    eventCacheReports: [],

    dataElements: {
      "bpBUOvqy1Jn": {groupby: "BCG", name: "BCG"},
      "EMcT5j5zR81": {groupby: "BCG", name: "BCG scar"},
      "KRF40x6EILp": {groupby: "BCG", name: "BCG repeat dose"},
      "no7SkAxepi7": {groupby: "OPV", name: "OPV 0"},
      "CfPM8lsEMzH": {groupby: "OPV", name: "OPV 1"},
      "K3TcJM1ySQA": {groupby: "DPT", name: "DPT-HepB-Hib1"},
      "fmXCCPENnwR": {groupby: "PCV", name: "PCV 1"},
      "nIqQYeSwU9E": {groupby: "RV", name: "RV 1"},
      "sDORmAKh32v": {groupby: "OPV", name: "OPV 2"},
      "PvHUllrtPiy": {groupby: "PCV", name: "PCV 2"},
      "wYg2gOWSyJG": {groupby: "RV", name: "RV 2"},
      "nQeUfqPjK5o": {groupby: "OPV", name: "OPV 3"},
      "pxCZNoqDVJC": {groupby: "DPT", name: "DPT-HepB-Hib3"},
      "B4eJCy6LFLZ": {groupby: "PCV", name: "PCV 3"},
      "cNA9EmFaiAa": {groupby: "OPV", name: "OPV 4"},
      "g8dMiUOTFla": {groupby: "Measles", name: "Measles 1"},
      "Bxh1xgIY9nA": {groupby: "Measles", name: "Measles 2"}
    },

    attributes: {
      eventId: "Event ID",
      dueDate: "Due date",
      sB1IHYu2xQT: "First Name",
      wbtl3uN0spv: "Child Name",
      rKtHjgcO2Bn: "Age"
    }
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
