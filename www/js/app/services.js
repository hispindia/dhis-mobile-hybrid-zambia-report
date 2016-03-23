angular.module('app.services', ['ngProgress'])
  .service('sApiCall', function ($http, $q, mInitdata, sUtils) {

    var host, orgUid;

    this.initHost = function (_host, _orgUid) {
      host = _host;
      orgUid = _orgUid;
    };

    this.getMe = function (_host, authen) {
      var hostT = host;
      if (sUtils.isValue(_host)) {
        hostT = _host;
      }
      if (sUtils.isValue(authen)) {
        $http.defaults.headers.common.Authorization = authen;
      }
      return httpPromise("GET", hostT + "/api/me");
    };
    this.getConstants = function () {
      return httpPromise("GET", host + "/api/constants.json?paging=false");
    };
    this.getProgramTrackedEntityAttributes = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = mInitdata.programUID;
      }
      return httpPromise("GET", host + "/api/programs/" + programUID + ".json?paging=false&fields=id,name,programStages[*],programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]]");
    };
    this.getProgramStageDataElements = function (programStageUID) {
      if (!sUtils.isValue(programStageUID)) {
        programStageUID = mInitdata.programStageUID;
      }
      return httpPromise("GET", host + "/api/programStages/" + programStageUID + ".json?paging=false&fields=id,name,programStageDataElements[*,dataElement[*]]");
    };
    this.getProgramIndicators = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = mInitdata.programUID;
      }
      return httpPromise("GET", host + "/api/programIndicators.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };
    this.getProgramValidations = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = mInitdata.programUID;
      }
      return httpPromise("GET", host + "/api/programValidations.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };
    this.getProgramRuleVariables = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = mInitdata.programUID;
      }
      return httpPromise("GET", host + "/api/programRuleVariables.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };
    this.getProgramRules = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = mInitdata.programUID;
      }
      return httpPromise("GET", host + "/api/programRules.json?paging=false&fields=*,programRuleActions[*]&filter=program.id:eq:" + programUID);
    };
    this.getEvents = function (programStageUID, orgUnit, ouMode, status) {
      if (!sUtils.isValue(programStageUID)) {
        programStageUID = mInitdata.programStageUID;
      }
      if (!sUtils.isValue(orgUnit)) {
        orgUnit = orgUid;
      }
      if (!sUtils.isValue(ouMode)) {
        ouMode = mInitdata.ouMode;
      }
      if (!sUtils.isValue(status)) {
        status = mInitdata.eventStatus;
      }
      return httpPromise("GET", host + "/api/events.json?paging=false&skipPaging=true&programStage=" + programStageUID + "&orgUnit=" + orgUnit + "&ouMode=" + ouMode + "&status=" + status);
    };

    this.getTrackedEntityInstances = function (trackedEntityInstanceUID) {
      return httpPromise("GET", host + "/api/trackedEntityInstances/" + trackedEntityInstanceUID + ".json?paging=false");
    };
    this.getEnrollments = function (enrollmentUID) {
      return httpPromise("GET", host + "/api/enrollments/" + enrollmentUID + ".json?paging=false&");
    };
    this.getEventTrackedEntityInstances = function (trackedEntityInstanceUID) {
      return httpPromise("GET", host + "/api/events.json?paging=false&trackedEntityInstance=" + trackedEntityInstanceUID);
    };

    var httpPromise = function (method, url) {
      var defer = $q.defer();
      var req = {
        method: method,
        url: url
      };

      $http(req).then(function (response) {
        if (typeof response.data === 'object') {
          defer.resolve(response.data);
        } else {
          defer.reject(response.data);
        }
      }, function (error) {
        defer.reject(error);
      });
      return defer.promise;
    };

    this.makePromise = function (obj) {
      return $q(function (resolve, reject) {
        resolve(obj);
      });
    }

  })

  .service('sInitDataService', function ($rootScope, $http, $q, d2sDateUtils, mCODE, mEventDetails, mDataCommon, mInitdata, sUtils, sRuleHelper, sApiCall, sConfigVariableApp) {

    this.loadDataCommonFromLocal = function () {

      var initial = sUtils.getLocal().get(mCODE.STORAGE.INITIAL);
      if (initial == 1) {
        var expireTimeout = mInitdata.commonExpire;
        var expireTime = sUtils.getLocal().get(mCODE.STORAGE.COMMONTIME);

        if (moment().isAfter(moment(expireTime).add(expireTimeout, mInitdata.commonExpireUnit))) {
          console.log("expired");
          sUtils.getLocal().set(mCODE.STORAGE.INITIAL, 0);
        }

        mDataCommon.constants = sUtils.getLocal().get(mCODE.STORAGE.GETCONSTANTS);
        mDataCommon.programTrackedEntityAttributes = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMTRACKEDENTITYATTRIBUTES);
        mDataCommon.programStageDataElements = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMSTAGEDATAELEMENTS);
        mDataCommon.programIndicators = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMINDICATORS);
        mDataCommon.programValidations = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMVALIDATIONS);
        mDataCommon.programRuleVariables = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMRULEVARIABLES);
        mDataCommon.programRules = sUtils.getLocal().get(mCODE.STORAGE.GETPROGRAMRULES);
        mDataCommon.events = sUtils.getLocal().get(mCODE.STORAGE.GETEVENTS);

        if (!isDetailExpired()) {
          fetchEventDetails();
        }
        return true;
      }
      return false;
    };

    this.updateDetailExpire = function () {
      sUtils.getLocal().set(mCODE.STORAGE.INITIALDETAILS, 1);
      sUtils.getLocal().set(mCODE.STORAGE.DETAILSTIME, moment());
    };

    this.populateData = function () {
      if (!this.loadDataCommonFromLocal()) {
        this.initCommonDB();
      }
      //sInitDataService.initMockupCommonDB();
      //sInitDataService.mockupEventDB();

    };

    this.initCommonDB = function () {

      var promiseArr = [];
      promiseArr.push(
        sApiCall.getConstants(),
        sApiCall.getProgramTrackedEntityAttributes(),
        sApiCall.getProgramStageDataElements(),
        sApiCall.getProgramIndicators(),
        sApiCall.getProgramValidations(),
        sApiCall.getProgramRuleVariables(),
        sApiCall.getProgramRules(),
        sApiCall.getEvents()
      );
      return $q.all(promiseArr).then(function (values) {
        mDataCommon.constants = values[0].constants;
        mDataCommon.programTrackedEntityAttributes = values[1].programTrackedEntityAttributes;
        mDataCommon.programStageDataElements = values[2].programStageDataElements;
        mDataCommon.programIndicators = values[3].programIndicators;
        mDataCommon.programValidations = values[4].programValidations;
        mDataCommon.programRuleVariables = values[5].programRuleVariables;
        mDataCommon.programRules = values[6].programRules;
        mDataCommon.events = values[7].events;

        $rootScope.$broadcast(mCODE.MSG.UPDATECOMMONDB);
        saveDataCommonToLocal(mDataCommon.constants, mDataCommon.programTrackedEntityAttributes, mDataCommon.programStageDataElements, mDataCommon.programIndicators,
          mDataCommon.programValidations, mDataCommon.programRuleVariables, mDataCommon.programRules, mDataCommon.events);
        fetchEventDetails();
      }, function (error) {
        $rootScope.$broadcast(mCODE.MSG.APIERROR, error);
      });
    };

    function fetchEventDetails() {

      mDataCommon.eventCacheReports = [];
      for (var i = 0; i < mDataCommon.events.length; i++) {
        $q.all([
          sApiCall.makePromise(mDataCommon.events[i]),
          sApiCall.getTrackedEntityInstances(mDataCommon.events[i].trackedEntityInstance),
          sApiCall.getEnrollments(mDataCommon.events[i].enrollment),
          sApiCall.getEventTrackedEntityInstances(mDataCommon.events[i].trackedEntityInstance)
        ]).then(function (values) {
          var executingEvent = values[0];
          var eventDetails = {
            trackedEntityInstances: values[1],
            enrollments: values[2],
            eventTEI: values[3].events
          };

          var rulesEffect = sRuleHelper.executeRules(mInitdata.programUID, executingEvent, eventDetails.trackedEntityInstances, eventDetails.enrollments, eventDetails.eventTEI);
          var programStageDataElementsMap = sRuleHelper.programStageDataElementsMap();
          var programTrackedEntityAttributesMap = sRuleHelper.programTrackedEntityAttributesMap();

          //populate completed data values of attributes
          var dataAttributeValues = [];
          angular.forEach(eventDetails.trackedEntityInstances.attributes, function (item) {
            dataAttributeValues[item.attribute] = item;
          });

          //populate completed data values of data element.
          var dataElementValues = [];
          angular.forEach(eventDetails.eventTEI, function (event) {
            angular.forEach(event.dataValues, function (dataValue) {
              dataElementValues[dataValue.dataElement] = dataValue;
            })
          });

          // processRuleEffects
          for (var key in rulesEffect) {
            var effect = rulesEffect[key];
            if (effect.dataElement && effect.ineffect) {
              if (effect.action == "HIDEFIELD") {
                programStageDataElementsMap[rulesEffect[key].dataElement.id]["action"] = "hidden";
              }
              if (effect.data) {
                programStageDataElementsMap[rulesEffect[key].dataElement.id].dataElement.value = effect.data;
              }
            }
          }

          var eventInfo = angular.copy(mEventDetails);
          eventInfo.eventId = executingEvent.event;
          eventInfo.dueDate = d2sDateUtils.formatYYYMMDD(executingEvent.dueDate);


          //populate data value for attributes
          for (var key in programTrackedEntityAttributesMap) {
            if (dataAttributeValues[key]) {
              if (key == 'rKtHjgcO2Bn') {
                eventInfo[key] = sUtils.getAge(dataAttributeValues[key].value);
              } else {
                eventInfo[key] = dataAttributeValues[key].value;
              }
            }else{
              if (key == 'rKtHjgcO2Bn') {
                eventInfo[key] = "N/A";
              }
            }
          }


          //populate data value for data element
          for (var key in programStageDataElementsMap) {
            var programStageDataElement = programStageDataElementsMap[key];
            if (dataElementValues[key] && programStageDataElement.dataElement.value == undefined) {
              programStageDataElement.dataElement.value = dataElementValues[key].value;
            }
            if (programStageDataElement.dataElement.value != undefined || programStageDataElement["action"] != "hidden") {

              eventInfo[key] = (programStageDataElement.dataElement.value ?
                programStageDataElement.dataElement.value : (dataElementValues[key] ? dataElementValues[key].value : "+"));

              //var log = "Name: " + programStageDataElement.dataElement.name + " - value: " + (programStageDataElement.dataElement.value ?
              //    programStageDataElement.dataElement.value : (dataElementValues[key] ? dataElementValues[key].value : undefined)) + " - key: " + key;
              //console.log(log);
            }
          }
          $rootScope.$broadcast(mCODE.MSG.EVENTDETAILS, {evenInfo: eventInfo});


        });
        //if (i == 1) break;
      }
    }

    function isDetailExpired() {
      var initial = sUtils.getLocal().get(mCODE.STORAGE.INITIALDETAILS);
      if (initial == 1) {
        var expireTimeout = mInitdata.detailsExpire;
        var expireTime = sUtils.getLocal().get(mCODE.STORAGE.DETAILSTIME);
        if (moment().isAfter(moment(expireTime).add(expireTimeout, mInitdata.detailsExpireUnit))) {
          console.log("expired details");
          sUtils.getLocal().set(mCODE.STORAGE.INITIALDETAILS, 0);
        }
        return true;
      }
      return false;
    }

    function saveDataCommonToLocal(getConstants, getProgramTrackedEntityAttributes, getProgramStageDataElements, getProgramIndicators,
                                   getProgramValidations, getProgramRuleVariables, getProgramRules, getEvents) {
      sUtils.getLocal().set(mCODE.STORAGE.INITIAL, 1);
      sUtils.getLocal().set(mCODE.STORAGE.COMMONEXPIRE, mInitdata.commonExpire);
      sUtils.getLocal().set(mCODE.STORAGE.COMMONTIME, moment());
      sUtils.getLocal().set(mCODE.STORAGE.GETCONSTANTS, getConstants);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMTRACKEDENTITYATTRIBUTES, getProgramTrackedEntityAttributes);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMSTAGEDATAELEMENTS, getProgramStageDataElements);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMINDICATORS, getProgramIndicators);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMVALIDATIONS, getProgramValidations);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMRULEVARIABLES, getProgramRuleVariables);
      sUtils.getLocal().set(mCODE.STORAGE.GETPROGRAMRULES, getProgramRules);
      sUtils.getLocal().set(mCODE.STORAGE.GETEVENTS, getEvents);

    }

  })

  .service('sRuleHelper', function ($filter, d2sDateUtils, d2sTrackerRulesExecutionService, sUtils, mInitdata, mDataCommon) {

    this.programRulesObject = function (programUid) {
      return {
        constants: mDataCommon.constants,
        programIndicators: computeProgramIndicators(mDataCommon, programUid),
        programValidations: mDataCommon.programValidations,
        programVariables: mDataCommon.programRuleVariables,
        programRules: computeProgramRules(mDataCommon)
      }
    };

    this.programTrackedEntityAttributesMap = function () {
      var programTrackedEntityAttributesMap = [];
      angular.forEach(mDataCommon.programTrackedEntityAttributes, function (item) {
        programTrackedEntityAttributesMap[item["trackedEntityAttribute"]["id"]] = angular.copy(item);
      });
      return programTrackedEntityAttributesMap;
    };

    this.programStageDataElementsMap = function () {
      var programStageDataElementsMap = [];
      angular.forEach(mDataCommon.programStageDataElements, function (item) {
        programStageDataElementsMap[item["dataElement"]["id"]] = angular.copy(item);
      });
      return programStageDataElementsMap;
    };

    this.eventsByStageEVSObject = function (eventTEI) {
      var eventAllStage = eventTEI;
      var eventByStage = [];
      angular.forEach(eventAllStage, function (item) {
        generateEventSortingDate(item);
        if (!eventByStage.hasOwnProperty(item.programStage)) {
          eventByStage[item.programStage] = [];
        }
        eventByStage[item.programStage].push(item);
      });

      //sort by date ascending
      eventAllStage.sort(function (a, b) {
        var dateA = new Date(a["sortingDate"]), dateB = new Date(b["sortingDate"]);
        return dateA - dateB;
      });

      return {
        all: eventAllStage,
        byStage: eventByStage
      }
    };

    this.flagObject = function () {
      return {debug: true, verbose: false};
    };

    this.validateExecutingEventObject = function (eventObj) {
      if (eventObj.dataValues) {
        for (var i = 0; i < eventObj.dataValues.length; i++) {
          eventObj[eventObj.dataValues[i].dataElement] = eventObj.dataValues[i].value;
        }
      }
      generateEventSortingDate(eventObj, true);
      return eventObj;
    };

    this.executeRules = function (programUID, executingEvent, trackedEntityInstances, enrollments, eventTEI) {
      var rulesEffectResponse = angular.copy(d2sTrackerRulesExecutionService.executeRulesBID(
        this.programRulesObject(programUID),
        this.validateExecutingEventObject(executingEvent),
        this.eventsByStageEVSObject(eventTEI),
        this.programStageDataElementsMap(),
        trackedEntityInstances,
        enrollments,
        this.flagObject()));
      return rulesEffectResponse.ruleeffects;
    };

    var computeProgramIndicators = function (mDataCommon, programUid) {
      var variables = [];
      var programRules = [];
      angular.forEach(mDataCommon.programIndicators, function (pi) {
        if (pi.displayInForm) {
          var newAction = {
            id: pi.id,
            content: pi.displayDescription ? pi["displayDescription"] : pi.name,
            data: pi.expression,
            programRuleActionType: 'DISPLAYKEYVALUEPAIR',
            location: 'indicators'
          };
          var newRule = {
            name: pi.name,
            id: pi.id,
            shortname: pi.shortname,
            code: pi.code,
            program: pi.program,
            description: pi.description,
            condition: pi.filter ? pi.filter : 'true',
            programRuleActions: [newAction]
          };

          programRules.push(newRule);

          var variablesInCondition = newRule.condition.match(/[A#]{\w+.?\w*}/g);
          var variablesInData = newAction.data.match(/[A#]{\w+.?\w*}/g);
          var valueCountPresent = newRule.condition.indexOf("V{value_count}") >= 0
            || newAction.data.indexOf("V{value_count}") >= 0;
          var positiveValueCountPresent = newRule.condition.indexOf("V{zero_pos_value_count}") >= 0
            || newAction.data.indexOf("V{zero_pos_value_count}") >= 0;
          var variableObjectsCurrentExpression = [];

          var pushDirectAddressedVariable = function (variableWithCurls) {
            var variableName = $filter('d2fTrimVariableQualifiers')(variableWithCurls);
            var variableNameParts = variableName.split('.');

            var newVariableObject;

            if (variableNameParts.length === 2) {
              //this is a programstage and dataelement specification. translate to program variable:
              newVariableObject = {
                name: variableName,
                programRuleVariableSourceType: 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE',
                dataElement: variableNameParts[1],
                programStage: variableNameParts[0],
                program: programUid
              };
            }
            else if (variableNameParts.length === 1) {
              //This is an attribute - let us translate to program variable:
              newVariableObject = {
                name: variableName,
                programRuleVariableSourceType: 'TEI_ATTRIBUTE',
                trackedEntityAttribute: variableNameParts[0],
                program: programUid
              };
            }
            variables.push(newVariableObject);

            return newVariableObject;

          };

          angular.forEach(variablesInCondition, function (variableInCondition) {
            var pushed = pushDirectAddressedVariable(variableInCondition);
          });

          angular.forEach(variablesInData, function (variableInData) {
            var pushed = pushDirectAddressedVariable(variableInData);

            //We only count the number of values in the data part of the rule
            //(Called expression in program indicators)
            variableObjectsCurrentExpression.push(pushed);
          });

          //Change expression or data part of the rule to match the program rules execution model

          if (valueCountPresent) {
            var valueCountText = '';
            angular.forEach(variableObjectsCurrentExpression, function (variableCurrentRule) {
              if (valueCountText) {
                //This is not the first value in the value count part of the expression.
                valueCountText += ' + d2:count(\'' + variableCurrentRule.name + '\')';
              }
              else {
                //This is the first part value in the value count expression:
                valueCountText = '(d2:count(\'' + variableCurrentRule.name + '\')';
              }
            });
            //To finish the value count expression we need to close the paranthesis:
            valueCountText += ')';

            //Replace all occurrences of value counts in both the data and expression:
            newRule.condition = newRule.condition.replace(new RegExp("V{value_count}", 'g'), valueCountText);
            newAction.data = newAction.data.replace(new RegExp("V{value_count}", 'g'), valueCountText);
          }
          if (positiveValueCountPresent) {
            var zeroPosValueCountText;
            angular.forEach(variableObjectsCurrentExpression, function (variableCurrentRule) {
              if (zeroPosValueCountText) {
                //This is not the first value in the value count part of the expression.
                zeroPosValueCountText += '+ d2:countifzeropos(\'' + variableCurrentRule.name + '\')';
              }
              else {
                //This is the first part value in the value count expression:
                zeroPosValueCountText = '(d2:countifzeropos(\'' + variableCurrentRule.name + '\')';
              }
            });
            //To finish the value count expression we need to close the paranthesis:
            zeroPosValueCountText += ')';

            //Replace all occurrences of value counts in both the data and expression:
            newRule.condition = newRule.condition.replace(new RegExp("V{zero_pos_value_count}", 'g'), zeroPosValueCountText);
            newAction.data = newAction.data.replace(new RegExp("V{zero_pos_value_count}", 'g'), zeroPosValueCountText);
          }
        }
      });

      return {rules: programRules, variables: variables};
    };

    var computeProgramRules = function (mDataCommon) {
      var programRules = [];
      angular.forEach(mDataCommon.programRules, function (rule) {
        rule.actions = [];
        rule.programStageId = rule.programStage && rule.programStage.id ? rule.programStage.id : null;
        programRules.push(rule);
      });
      return programRules;
    };

    /**
     * Addition of property sortingDate with format YYYY-MM-DD
     * evtDateUpdate = true: Update event date if not eventDate not exist
     * @param event
     * @param evtDateUpdate
     */
    var generateEventSortingDate = function (event, evtDateUpdate) {
      if (!event.eventDate) {
        event["sortingDate"] = d2sDateUtils.getToday();
      } else {
        event["sortingDate"] = d2sDateUtils.formatYYYMMDD(event.eventDate);
      }
      if (evtDateUpdate) {
        event["eventDate"] = event["sortingDate"];
      }
    }
  })

  .service('sUtils', function ($indexedDB, localStorageService, mCODE) {

    this.getLocal = function () {
      return localStorageService
    };

    this.openStore = function (funcStore) {
      $indexedDB.openStore(mCODE.STORAGE.DBNAME, funcStore);
    };


    /**
     * Check obj is String not empty, blank, null or undefine
     * @param obj
     * @returns {boolean}
     */
    this.isValue = function (obj) {
      if (!obj || 0 === obj.length || /^\s*$/.test(obj) || !obj.trim()) return false;
      return true;
    };

    this.prettyJsonPrint = function (obj) {
      return json.prettyPrint(obj);
    };

    this.countObjectLength = function(obj){
      return Object.keys(obj).length;
    };

    this.deepCopy = function deepCopy(obj) {
      if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
          out[i] = arguments.callee(obj[i]);
        }
        return out;
      }
      if (typeof obj === 'object') {
        var out = {}, i;
        for (i in obj) {
          out[i] = arguments.callee(obj[i]);
        }
        return out;
      }
      return obj;
    };

    this.getAge = function getAge(dateString) {
      var res = moment(dateString).fromNow().replace("ago", "");
      return res;
    };

    var json = {
      replacer: function (match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class=json-key>';
        var val = '<span class=json-value>';
        var str = '<span class=json-string>';
        var r = pIndent || '';
        if (pKey)
          r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal)
          r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
      },
      prettyPrint: function (obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        return JSON.stringify(obj, null, 3)
          .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(jsonLine, json.replacer);
      }
    };


  })

  .service('sAuthentication', function ($http, $rootScope, mInitdata, mCODE, sApiCall, sUtils, sConfigVariableApp, sInitDataService) {
    var login = {
      host: undefined,
      authen: undefined
    };

    /**
     * - Check had login or not
     * - Update host for sApiCall
     * - Update http default headers
     * @param broadcast Send broadcast message mCODE.MSG.ISLOGIN if had login or mCODE.MSG.ISLOGOUT otherwise
     * @returns {boolean}
     */
    this.isLogin = function (broadcast) {
      login.host = sUtils.getLocal().get(mCODE.STORAGE.URL);
      login.authen = sUtils.getLocal().get(mCODE.STORAGE.AUTHEN);

      if (sUtils.isValue(login.host) && sUtils.isValue(login.authen)) {

        sApiCall.initHost(login.host, sUtils.getLocal().get(mCODE.STORAGE.ORGUID));
        sConfigVariableApp.initApp(mInitdata.evn_setup);
        $http.defaults.headers.common.Authorization = login.authen;
        if (broadcast) {
          $rootScope.$broadcast(mCODE.MSG.ISLOGIN);
        }
        return true;
      }
      if (broadcast) {
        $rootScope.$broadcast(mCODE.MSG.ISLOGOUT);
      }
      return false;
    };

    this.logout = function () {
      sUtils.openStore(function (store) {
        store.clear();
      });
      sUtils.getLocal().clearAll();
      $rootScope.$broadcast(mCODE.MSG.ISLOGOUT);
    };

    this.getLogin = function () {
      if (this.isLogin()) {
        return login;
      }
      return null;
    };

    /**
     * Setup initial data when logic success
     * - Save host and authen string to localStorageService
     * - Setup defaults header for http
     * - Update host for sApiCall
     * @param host
     * @param authen
     * @param orgUid
     */
    this.setupAuthenSuccess = function (host, authen, orgUid) {
      sUtils.getLocal().set(mCODE.STORAGE.URL, host);
      sUtils.getLocal().set(mCODE.STORAGE.AUTHEN, authen);
      sUtils.getLocal().set(mCODE.STORAGE.ORGUID, orgUid);
      if (this.isLogin(true)) {
        sInitDataService.populateData();
      }
    }
  })

  .factory('sBlankFactory', [function () {

  }])
  .service('sBlankService', [function () {

  }]);


