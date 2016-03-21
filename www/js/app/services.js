angular.module('app.services', ['ngProgress'])
  .service('sApiCall', function ($http, $q, localStorageService, mCODE, sUtils) {

    var host = localStorageService.get(mCODE.STORAGE.URL);
    var orgUid = localStorageService.get(mCODE.STORAGE.ORGUID);

    this.getMe = function (_host, authen) {
      var hostT=host;
      if(sUtils.isValue(_host)){
        hostT=_host;
      }
      if(sUtils.isValue(authen)){
        $http.defaults.headers.common.Authorization = authen;
      }
      return httpPromise("GET", hostT + "/api/me");
    };

    this.getConstants = function () {
      return httpPromise("GET", host + "/api/constants.json?paging=false");
    };

    this.programTrackedEntityAttributes = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = "SSLpOM0r1U7";
      }
      return httpPromise("GET", host + "/api/programs/" + programUID + ".json?paging=false&fields=id,name,programStages[*],programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]]");
    };
    this.programStageDataElements = function (programStageUID) {
      if (!sUtils.isValue(programStageUID)) {
        programStageUID = "s53RFfXA75f";
      }
      return httpPromise("GET", host + "/api/programStages/" + programStageUID + ".json?paging=false&fields=id,name,programStageDataElements[*,dataElement[*]]");
    };
    this.programIndicators = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = "SSLpOM0r1U7";
      }
      return httpPromise("GET", host + "/api/programIndicators.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };
    this.programValidations = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = "SSLpOM0r1U7";
      }
      return httpPromise("GET", host + "/api/programValidations.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };

    this.programRuleVariables = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = "SSLpOM0r1U7";
      }
      return httpPromise("GET", host + "/api/programRuleVariables.json?paging=false&fields=*&filter=program.id:eq:" + programUID);
    };
    this.programRules = function (programUID) {
      if (!sUtils.isValue(programUID)) {
        programUID = "SSLpOM0r1U7";
      }
      return httpPromise("GET", host + "/api/programRules.json?paging=false&fields=*,programRuleActions[*]&filter=program.id:eq:" + programUID);
    };

    this.events = function (programStageUID, orgUnit, ouMode, status) {
      if (!sUtils.isValue(programStageUID)) {
        programStageUID = "s53RFfXA75f";
      }
      if (!sUtils.isValue(orgUnit)) {
        orgUnit = orgUid;
      }
      if (!sUtils.isValue(ouMode)) {
        ouMode = "SELECTED";
      }
      if (!sUtils.isValue(status)) {
        status = "SCHEDULE";
      }
      return httpPromise("GET", host + "/api/events.json?paging=false&skipPaging=true&programStage=" + programStageUID + "&orgUnit=" + orgUnit + "&ouMode=" + ouMode + "&status=" + status);
    };

    this.trackedEntityInstances = function (trackedEntityInstanceUID) {
      return httpPromise("GET", host + "/api/trackedEntityInstances/" + trackedEntityInstanceUID + ".json?paging=false");
    };
    this.enrollments = function (enrollmentUID) {
      return httpPromise("GET", host + "/api/enrollments/" + enrollmentUID + ".json?paging=false&");
    };
    this.eventTrackedEntityInstances = function (trackedEntityInstanceUID) {
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


  })

  .service('sInitDataService', function ($http, mDataCommon, sConfigVariableApp) {
    this.initCommonDB = function () {
      var url = "../../model/";
      if (sConfigVariableApp.isSTAGING()) {
        url = "file:///android_asset/www/model/"
      }
      $http.get(url + 'constants.json').success(function (data) {
        mDataCommon.constants = data.constants;
      });
      $http.get(url + 'programIndicators.json').success(function (data) {
        mDataCommon.programIndicators = data.programIndicators;
      });
      $http.get(url + 'programValidations.json').success(function (data) {
        mDataCommon.programValidations = data.programValidations;
      });
      $http.get(url + 'programRuleVariables.json').success(function (data) {
        mDataCommon.programRuleVariables = data.programRuleVariables;
      });
      $http.get(url + 'programRules.json').success(function (data) {
        mDataCommon.programRules = data.programRules;
      });
      $http.get(url + 'programStageDataElements.json').success(function (data) {
        mDataCommon.programStageDataElements = data.programStageDataElements;
      });
      $http.get(url + 'programTrackedEntityAttributes.json').success(function (data) {
        mDataCommon.programTrackedEntityAttributes = data.programTrackedEntityAttributes;
      });
      $http.get(url + 'events.json').success(function (data) {
        mDataCommon.events = data.events;
      });
    };
    this.mockupDB = function () {
      var url = "../../model/";
      if (sConfigVariableApp.isSTAGING()) {
        url = "file:///android_asset/www/model/"
      }
      //  Get mockup date first event
      $http.get(url + 'trackedEntityInstances.json').success(function (data) {
        mDataCommon.trackedEntityInstances = data;
      });
      $http.get(url + 'enrollments.json').success(function (data) {
        mDataCommon.enrollments = data;
      });
      $http.get(url + 'eventsTEI.json').success(function (data) {
        mDataCommon.eventsTEI = data.events;
      });
    }
  })

  .service('sRuleHelper', function ($filter, mDataCommon, DateUtils, TrackerRulesExecutionService) {
    this.programRulesObject = function (programUid) {
      return {
        constants: mDataCommon.constants,
        programIndicators: computeProgramIndicators(mDataCommon, programUid),
        programValidations: mDataCommon.programValidations,
        programVariables: mDataCommon.programRuleVariables,
        programRules: computeProgramRules(mDataCommon)
      }
    };

    this.programStageDataElementsMap = function () {
      var programStageDataElementsMap = [];
      angular.forEach(mDataCommon.programStageDataElements, function (item) {
        programStageDataElementsMap[item["dataElement"]["id"]] = item;
      });
      return programStageDataElementsMap;
    };

    this.eventsByStageEVSObject = function () {
      var eventAllStage = mDataCommon.eventsTEI;
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
      console.log("sort eventAllStage");
      console.log(eventAllStage);

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

    this.excuteRules = function () {
      var rulesEffectResponse = TrackerRulesExecutionService.executeRulesBID(
        this.programRulesObject("SSLpOM0r1U7"),
        this.validateExecutingEventObject(mDataCommon.events[0]),
        this.eventsByStageEVSObject(),
        this.programStageDataElementsMap(),
        mDataCommon.trackedEntityInstances,
        mDataCommon.enrollments,
        this.flagObject());
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
            var variableName = $filter('trimvariablequalifiers')(variableWithCurls);
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
    }

    var computeProgramRules = function (mDataCommon) {
      var programRules = [];
      angular.forEach(mDataCommon.programRules, function (rule) {
        rule.actions = [];
        rule.programStageId = rule.programStage && rule.programStage.id ? rule.programStage.id : null;
        programRules.push(rule);
      });
      return programRules;
    }

    /**
     * Addition of property sortingDate with format YYYY-MM-DD
     * evtDateUpdate = true: Update event date if not eventDate not exist
     * @param event
     * @param evtDateUpdate
     */
    var generateEventSortingDate = function (event, evtDateUpdate) {
      if (!event.eventDate) {
        event["sortingDate"] = DateUtils.getToday();
      } else {
        event["sortingDate"] = DateUtils.formatYYYMMDD(event.eventDate);
      }
      if (evtDateUpdate) {
        event["eventDate"] = event["sortingDate"];
      }
    }
  })

  .service('sUtils', function () {

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

  .service('sAuthentication', function ($http, $rootScope, localStorageService, mCODE, sUtils, sInitDataService, sConfigVariableApp, sInitApp, sApiCall) {
    var login = {
      host: undefined,
      authen: undefined
    };

    /**
     * Check had login or not
     * @param broadcast Send broadcast message mCODE.MSG.ISLOGIN if had login or mCODE.MSG.ISLOGOUT otherwise
     * @returns {boolean}
     */
    this.isLogin = function (broadcast) {
      login.host = localStorageService.get(mCODE.STORAGE.URL);
      login.authen = localStorageService.get(mCODE.STORAGE.AUTHEN);
      if (sUtils.isValue(login.host) && sUtils.isValue(login.authen)) {
        if (broadcast) {
          $http.defaults.headers.common.Authorization = login.authen;
          sInitApp.populateData();
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
      localStorageService.clearAll();
      $rootScope.$broadcast(mCODE.MSG.ISLOGOUT);
    };

    this.getLogin = function () {
      if (this.isLogin()) {
        return login;
      }
      return null;
    };
  })

  .factory('sBlankFactory', [function () {

  }])
  .service('sBlankService', [function () {

  }]);


