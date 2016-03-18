angular.module('app.services', [])

  .factory('sBlankFactory', [function () {

  }])

  .service('sInitDataService', function ($http, mDataCommon) {
    this.initCommonDB = function () {
      $http.get('../bid/model/constants.json').success(function (data) {
        mDataCommon.constants = data.constants;
      });
      $http.get('../bid/model/programIndicators.json').success(function (data) {
        mDataCommon.programIndicators = data.programIndicators;
      });
      $http.get('../bid/model/programValidations.json').success(function (data) {
        mDataCommon.programValidations = data.programValidations;
      });
      $http.get('../bid/model/programRuleVariables.json').success(function (data) {
        mDataCommon.programRuleVariables = data.programRuleVariables;
      });
      $http.get('../bid/model/programRules.json').success(function (data) {
        mDataCommon.programRules = data.programRules;
      });
      $http.get('../bid/model/programStageDataElements.json').success(function (data) {
        mDataCommon.programStageDataElements = data.programStageDataElements;
      });
      $http.get('../bid/model/programTrackedEntityAttributes.json').success(function (data) {
        mDataCommon.programTrackedEntityAttributes = data.programTrackedEntityAttributes;
      });
      $http.get('../bid/model/events.json').success(function (data) {
        mDataCommon.events = data.events;
      });
    };
    this.mockupDB = function () {
      //  Get mockup date first event
      $http.get('../bid/model/trackedEntityInstances.json').success(function (data) {
        mDataCommon.trackedEntityInstances = data;
      });
      $http.get('../bid/model/enrollments.json').success(function (data) {
        mDataCommon.enrollments = data;
      });
      $http.get('../bid/model/eventsTEI.json').success(function (data) {
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
        this.validateExecutingEventObject(mDataCommon.events[6]),
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
        event["sortingDate"] = DateUtils.formatFromApiToUser(DateUtils.getToday());
      } else {
        event["sortingDate"] = DateUtils.formatFromApiToUser(event.eventDate);
      }
      if (evtDateUpdate) {
        event["eventDate"] = event["sortingDate"];
      }
    }
  })

  .service('sBlankService', [function () {

  }]);


