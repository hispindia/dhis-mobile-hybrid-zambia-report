/**
 * Created by nhancao on 3/18/16.
 */
'use strict';
angular.module('dhis2.compress', [])

  .constant("d2Const", {
    momentFormat: 'YYYY-MM-DD'
  })

  /* trim away all single and double quotes in the start and end of a string*/
  .filter('d2fTrimQuotes', function () {
    return function (input) {
      if (!input || (typeof input !== 'string' && !(input instanceof String))) {
        return input;
      }

      var beingTrimmed = input;
      var trimmingComplete = false;
      //Trim until no more quotes can be removed.
      while (!trimmingComplete) {
        var beforeTrimming = beingTrimmed;
        beingTrimmed = input.replace(/^'/, "").replace(/'$/, "");
        beingTrimmed = beingTrimmed.replace(/^"/, "").replace(/"$/, "");

        if (beforeTrimming.length === beingTrimmed.length) {
          trimmingComplete = true;
        }
      }


      return beingTrimmed;
    };
  })

  /* trim away the qualifiers before and after a variable name */
  .filter('d2fTrimVariableQualifiers', function () {
    return function (input) {
      if (!input || (typeof input !== 'string' && !(input instanceof String))) {
        return input;
      }

      var trimmed = input.replace(/^[#VCAvca]{/, "").replace(/}$/, "");

      return trimmed;
    };
  })

  /* Factory for loading translation strings */
  .factory('i18nLoader', function ($q, $http, d2sSessionStorageService) {

    var getTranslationStrings = function (locale) {
      var defaultUrl = 'i18n/i18n_app.properties';
      var url = '';
      if (locale === 'en' || !locale) {
        url = defaultUrl;
      }
      else {
        url = 'i18n/i18n_app_' + locale + '.properties';
      }

      var tx = {locale: locale};

      var promise = $http.get(url).then(function (response) {
        tx = {locale: locale, keys: dhis2.util.parseJavaProperties(response.data)};
        return tx;
      }, function () {

        setHeaderDelayMessage('No translation file is found for the selected locale. Using default translation (English).');

        var p = $http.get(defaultUrl).then(function (response) {
          tx = {locale: locale, keys: dhis2.util.parseJavaProperties(response.data)};
          return tx;
        });
        return p;
      });
      return promise;
    };

    var getLocale = function () {
      var locale = 'en';

      var promise = $http.get('../api/me/profile.json').then(function (response) {
        d2sSessionStorageService.set('USER_PROFILE', response.data);
        if (response.data && response.data.settings && response.data.settings.keyUiLocale) {
          locale = response.data.settings.keyUiLocale;
        }
        return locale;
      }, function () {
        return locale;
      });

      return promise;
    };

    return function () {
      var deferred = $q.defer(), translations;
      var userProfile = d2sSessionStorageService.get('USER_PROFILE');
      if (userProfile && userProfile.settings && userProfile.settings.keyUiLocale) {
        getTranslationStrings(userProfile.settings.keyUiLocale).then(function (response) {
          translations = response.keys;
          deferred.resolve(translations);
        });
        return deferred.promise;
      }
      else {
        getLocale().then(function (locale) {
          getTranslationStrings(locale).then(function (response) {
            translations = response.keys;
            deferred.resolve(translations);
          });
        });
        return deferred.promise;
      }
    };
  })

  /* Factory for loading external data */
  .factory('d2sExternalDataFactory', function ($http) {

    return {
      get: function (fileName) {
        var promise = $http.get(fileName).then(function (response) {
          return response.data;
        });
        return promise;
      }
    };
  })

  /* service for wrapping sessionStorage '*/
  .service('d2sSessionStorageService', function ($window) {
    return {
      get: function (key) {
        return JSON.parse($window.sessionStorage.getItem(key));
      },
      set: function (key, obj) {
        $window.sessionStorage.setItem(key, JSON.stringify(obj));
      },
      clearAll: function () {
        for (var key in $window.sessionStorage) {
          $window.sessionStorage.removeItem(key);
        }
      }
    };
  })

  /* service for dealing with dates */
  .service('d2sDateUtils', function (d2Const) {

    return {
      getToday: function () {
        return moment().format(d2Const.momentFormat);
      },
      formatYYYMMDD: function (dateValue) {
        if (!dateValue) {
          return;
        }
        return moment(dateValue).format(d2Const.momentFormat);
      },
      addDays2DateYYMMDD: function (dateValue, days) {
        this.formatYYYMMDD(dateValue).add(days, 'days');
      }
    };
  })

  /* Service for uploading/downloading file */
  .service('d2sFileService', function ($http) {

    return {
      get: function (uid) {
        var promise = $http.get('../api/fileResources/' + uid).then(function (response) {
          return response.data;
        });
        return promise;
      },
      delete: function (uid) {
        var promise = $http.get('../api/fileResources/' + uid).then(function (response) {
          return response.data;
        });
        return promise;
      },
      download: function (fileName) {
        var promise = $http.get(fileName).then(function (response) {
          return response.data;
        });
        return promise;
      },
      upload: function (file) {
        var formData = new FormData();
        formData.append('file', file);
        var headers = {transformRequest: angular.identity, headers: {'Content-Type': undefined}};
        var promise = $http.post('../api/fileResources', formData, headers).then(function (response) {
          return response.data;
        });
        return promise;
      }
    };
  })

  /* service for building variables based on the data in users fields */
  .service('d2sVariableService', function (d2sDateUtils, $filter, $log) {
    var processSingleValue = function (processedValue, valueType) {
      //First clean away single or double quotation marks at the start and end of the variable name.
      processedValue = $filter('d2fTrimQuotes')(processedValue);

      //Append single quotation marks in case the variable is of text or date type:
      if (valueType === 'LONG_TEXT' || valueType === 'TEXT' || valueType === 'DATE' || valueType === 'OPTION_SET') {
        if (processedValue) {
          processedValue = "'" + processedValue + "'";
        } else {
          processedValue = "''";
        }
      }
      else if (valueType === 'BOOLEAN' || valueType === 'TRUE_ONLY') {
        if (processedValue && eval(processedValue)) {
          processedValue = true;
        }
        else {
          processedValue = false;
        }
      }
      else if (valueType === "INTEGER" || valueType === "NUMBER" || valueType === "INTEGER_POSITIVE" || valueType === "INTEGER_NEGATIVE" || valueType === "INTEGER_ZERO_OR_POSITIVE" || valueType === "PERCENTAGE") {
        if (processedValue) {
          processedValue = Number(processedValue);
        } else {
          processedValue = 0;
        }
      }
      else {
        $log.warn("unknown datatype:" + valueType);
      }

      return processedValue;
    };

    var pushVariable = function (variables, variablename, varValue, allValues, varType, variablefound, variablePrefix, variableEventDate) {

      var processedValues = [];

      angular.forEach(allValues, function (alternateValue) {
        processedValues.push(processSingleValue(alternateValue, varType));
      });

      variables[variablename] = {
        variableValue: processSingleValue(varValue, varType),
        variableType: varType,
        hasValue: variablefound,
        variableEventDate: variableEventDate,
        variablePrefix: variablePrefix,
        allValues: processedValues
      };
      return variables;
    };

    return {
      processValue: function (value, type) {
        return processSingleValue(value, type);
      },
      getVariables: function (allProgramRules, executingEvent, evs, allDes, selectedEntity, selectedEnrollment) {

        var variables = {};

        var programVariables = allProgramRules.programVariables;

        programVariables = programVariables.concat(allProgramRules.programIndicators.variables);

        angular.forEach(programVariables, function (programVariable) {
          var dataElementId = programVariable.dataElement;
          if (programVariable.dataElement && programVariable.dataElement.id) {
            dataElementId = programVariable.dataElement.id;
          }

          var trackedEntityAttributeId = programVariable.trackedEntityAttribute;
          if (programVariable.trackedEntityAttribute && programVariable.trackedEntityAttribute.id) {
            trackedEntityAttributeId = programVariable.trackedEntityAttribute.id;
          }

          var programStageId = programVariable.programStage;
          if (programVariable.programStage && programVariable.programStage.id) {
            programStageId = programVariable.programStage.id;
          }

          var valueFound = false;
          //If variable evs is not defined, it means the rules is run before any events is registered, skip the types that require an event
          if (programVariable.programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE" && evs) {
            if (programStageId) {
              var allValues = [];
              angular.forEach(evs.byStage[programStageId], function (event) {
                if (event[dataElementId] !== null) {
                  if (angular.isDefined(event[dataElementId])) {
                    allValues.push(event[dataElementId]);
                    valueFound = true;
                    variables = pushVariable(variables, programVariable.name, event[dataElementId], allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', event.eventDate);
                  }
                }
              });
            } else {
              $log.warn("Variable id:'" + programVariable.id + "' name:'" + programVariable.name
                + "' does not have a programstage defined,"
                + " despite that the variable has sourcetype DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE");
            }
          }
          else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM" && evs) {
            var allValues = [];
            angular.forEach(evs.all, function (event) {
              if (angular.isDefined(event[dataElementId])
                && event[dataElementId] !== null) {
                allValues.push(event[dataElementId]);
                valueFound = true;
                variables = pushVariable(variables, programVariable.name, event[dataElementId], allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', event.eventDate);
              }
            });
          }
          else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_CURRENT_EVENT" && evs) {
            if (angular.isDefined(executingEvent[dataElementId])
              && executingEvent[dataElementId] !== null) {
              valueFound = true;
              variables = pushVariable(variables, programVariable.name, executingEvent[dataElementId], null, allDes[dataElementId].dataElement.valueType, valueFound, '#', executingEvent.eventDate);
            }
          }
          else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_PREVIOUS_EVENT" && evs) {
            //Only continue checking for a value if there is more than one event.
            if (evs.all && evs.all.length > 1) {
              var allValues = [];
              var previousvalue = null;
              var previousEventDate = null;
              var currentEventPassed = false;
              for (var i = 0; i < evs.all.length; i++) {
                //Store the values as we iterate through the stages
                //If the event[i] is not the current event, it is older(previous). Store the previous value if it exists
                if (!currentEventPassed && evs.all[i] !== executingEvent &&
                  angular.isDefined(evs.all[i][dataElementId])) {
                  previousvalue = evs.all[i][dataElementId];
                  previousEventDate = evs.all[i].eventDate;
                  allValues.push(previousvalue);
                  valueFound = true;
                }
                else if (evs.all[i] === executingEvent) {
                  //We have iterated to the newest event - store the last collected variable value - if any is found:
                  if (valueFound) {
                    variables = pushVariable(variables, programVariable.name, previousvalue, allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', previousEventDate);
                  }
                  //Set currentEventPassed, ending the iteration:
                  currentEventPassed = true;
                }
              }
            }
          }
          else if (programVariable.programRuleVariableSourceType === "TEI_ATTRIBUTE") {
            angular.forEach(selectedEntity.attributes, function (attribute) {
              if (!valueFound) {
                if (attribute.attribute === trackedEntityAttributeId) {
                  valueFound = true;
                  //In registration, the attribute type is found in .type, while in data entry the same data is found in .valueType.
                  //Handling here, but planning refactor in registration so it will always be .valueType
                  variables = pushVariable(variables, programVariable.name, attribute.value, null, attribute.type ? attribute.type : attribute.valueType, valueFound, 'A', '');
                }
              }
            });
          }
          else if (programVariable.programRuleVariableSourceType === "CALCULATED_VALUE") {
            //We won't assign the calculated variables at this step. The rules execution will calculate and assign the variable.
          }
          else {
            //If the rules was executed without events, we ended up in this else clause as expected, as most of the variables require an event to be mapped
            if (evs) {
              //If the rules was executed and events was supplied, we should have found an if clause for the the source type, and not ended up in this dead end else.
              $log.warn("Unknown programRuleVariableSourceType:" + programVariable.programRuleVariableSourceType);
            }
          }


          if (!valueFound) {
            //If there is still no value found, assign default value:
            if (dataElementId && allDes) {
              var dataElement = allDes[dataElementId];
              if (dataElement) {
                variables = pushVariable(variables, programVariable.name, "", null, dataElement.dataElement.valueType, false, '#', '');
              }
              else {
                $log.warn("Variable #{" + programVariable.name + "} is linked to a dataelement that is not part of the program");
                variables = pushVariable(variables, programVariable.name, "", null, "TEXT", false, '#', '');
              }
            }
            else if (programVariable.trackedEntityAttribute) {
              //The variable is an attribute, set correct prefix and a blank value
              variables = pushVariable(variables, programVariable.name, "", null, "TEXT", false, 'A', '');
            }
            else {
              //Fallback for calculated(assigned) values:
              variables = pushVariable(variables, programVariable.name, "", null, "TEXT", false, '#', '');
            }
          }
        });

        //add context variables:
        //last parameter "valuefound" is always true for event date
        variables = pushVariable(variables, 'current_date', d2sDateUtils.getToday(), null, 'DATE', true, 'V', '');

        variables = pushVariable(variables, 'event_date', executingEvent.eventDate, null, 'DATE', true, 'V', '');
        variables = pushVariable(variables, 'due_date', executingEvent.dueDate, null, 'DATE', true, 'V', '');
        variables = pushVariable(variables, 'event_count', evs ? evs.all.length : 0, null, 'INTEGER', true, 'V', '');

        variables = pushVariable(variables, 'enrollment_date', selectedEnrollment ? selectedEnrollment.enrollmentDate : '', null, 'DATE', selectedEnrollment ? true : false, 'V', '');
        variables = pushVariable(variables, 'enrollment_id', selectedEnrollment ? selectedEnrollment.enrollment : '', null, 'TEXT', selectedEnrollment ? true : false, 'V', '');
        variables = pushVariable(variables, 'event_id', executingEvent ? executingEvent.event : '', null, 'TEXT', executingEvent ? true : false, 'V', executingEvent ? executingEvent.eventDate : false);

        variables = pushVariable(variables, 'incident_date', selectedEnrollment ? selectedEnrollment.incidentDate : '', null, 'DATE', selectedEnrollment ? true : false, 'V', '');
        variables = pushVariable(variables, 'enrollment_count', selectedEnrollment ? 1 : 0, null, 'INTEGER', true, 'V', '');
        variables = pushVariable(variables, 'tei_count', selectedEnrollment ? 1 : 0, null, 'INTEGER', true, 'V', '');

        //Push all constant values:
        angular.forEach(allProgramRules.constants, function (constant) {
          variables = pushVariable(variables, constant.id, constant.value, null, 'INTEGER', true, 'C', '');
        });

        return variables;
      }
    };
  })

  /* service for executing tracker rules and broadcasting results */
  .service('d2sTrackerRulesExecutionService', function (d2sVariableService, d2sDateUtils, d2sEventFactory, $rootScope, $log, $filter, orderByFilter) {

    var replaceVariables = function (expression, variablesHash) {
      //replaces the variables in an expression with actual variable values.

      //Check if the expression contains program rule variables at all(any curly braces):
      if (expression.indexOf('{') !== -1) {
        //Find every variable name in the expression;
        var variablespresent = expression.match(/[A#CV]{\w+.?\w*}/g);
        //Replace each matched variable:
        angular.forEach(variablespresent, function (variablepresent) {
          //First strip away any prefix and postfix signs from the variable name:
          variablepresent = variablepresent.replace("#{", "").replace("A{", "").replace("C{", "").replace("V{", "").replace("}", "");

          if (angular.isDefined(variablesHash[variablepresent])) {
            //Replace all occurrences of the variable name(hence using regex replacement):
            expression = expression.replace(new RegExp(variablesHash[variablepresent].variablePrefix + "{" + variablepresent + "}", 'g'),
              variablesHash[variablepresent].variableValue);
          }
          else {
            //$log.warn("Expression " + expression + " conains variable " + variablepresent
            //  + " - but this variable is not defined." );
          }
        });
      }

      //Check if the expression contains environment  variables
      if (expression.indexOf('V{') !== -1) {
        //Find every variable name in the expression;
        var variablespresent = expression.match(/V{\w+.?\w*}/g);
        //Replace each matched variable:
        angular.forEach(variablespresent, function (variablepresent) {
          //First strip away any prefix and postfix signs from the variable name:
          variablepresent = variablepresent.replace("V{", "").replace("}", "");

          if (angular.isDefined(variablesHash[variablepresent]) &&
            variablesHash[variablepresent].variablePrefix === 'V') {
            //Replace all occurrences of the variable name(hence using regex replacement):
            expression = expression.replace(new RegExp("V{" + variablepresent + "}", 'g'),
              variablesHash[variablepresent].variableValue);
          }
          else {
            //$log.warn("Expression " + expression + " conains context variable " + variablepresent
            //  + " - but this variable is not defined." );
          }
        });
      }

      //Check if the expression contains attribute variables:
      if (expression.indexOf('A{') !== -1) {
        //Find every attribute in the expression;
        var variablespresent = expression.match(/A{\w+.?\w*}/g);
        //Replace each matched variable:
        angular.forEach(variablespresent, function (variablepresent) {
          //First strip away any prefix and postfix signs from the variable name:
          variablepresent = variablepresent.replace("A{", "").replace("}", "");

          if (angular.isDefined(variablesHash[variablepresent]) &&
            variablesHash[variablepresent].variablePrefix === 'A') {
            //Replace all occurrences of the variable name(hence using regex replacement):
            expression = expression.replace(new RegExp("A{" + variablepresent + "}", 'g'),
              variablesHash[variablepresent].variableValue);
          }
          else {
            //$log.warn("Expression " + expression + " conains attribute " + variablepresent
            //  + " - but this attribute is not defined." );
          }
        });
      }

      //Check if the expression contains constants
      if (expression.indexOf('C{') !== -1) {
        //Find every constant in the expression;
        var variablespresent = expression.match(/C{\w+.?\w*}/g);
        //Replace each matched variable:
        angular.forEach(variablespresent, function (variablepresent) {
          //First strip away any prefix and postfix signs from the variable name:
          variablepresent = variablepresent.replace("C{", "").replace("}", "");

          if (angular.isDefined(variablesHash[variablepresent]) &&
            variablesHash[variablepresent].variablePrefix === 'C') {
            //Replace all occurrences of the variable name(hence using regex replacement):
            expression = expression.replace(new RegExp("C{" + variablepresent + "}", 'g'),
              variablesHash[variablepresent].variableValue);
          }
          else {
            //$log.warn("Expression " + expression + " conains constant " + variablepresent
            //  + " - but this constant is not defined." );
          }
        });
      }

      return expression;
    };

    var runDhisFunctions = function (expression, variablesHash, flag) {
      //Called from "runExpression". Only proceed with this logic in case there seems to be dhis function calls: "d2:" is present.
      if (angular.isDefined(expression) && expression.indexOf("d2:") !== -1) {
        var dhisFunctions = [{name: "d2:daysBetween", parameters: 2},
          {name: "d2:weeksBetween", parameters: 2},
          {name: "d2:monthsBetween", parameters: 2},
          {name: "d2:yearsBetween", parameters: 2},
          {name: "d2:floor", parameters: 1},
          {name: "d2:modulus", parameters: 2},
          {name: "d2:concatenate"},
          {name: "d2:addDays", parameters: 2},
          {name: "d2:zing", parameters: 1},
          {name: "d2:oizp", parameters: 1},
          {name: "d2:count", parameters: 1},
          {name: "d2:countIfZeroPos", parameters: 1},
          {name: "d2:countIfValue", parameters: 2},
          {name: "d2:ceil", parameters: 1},
          {name: "d2:round", parameters: 1},
          {name: "d2:hasValue", parameters: 1},
          {name: "d2:lastEventDate", parameters: 1},
          {name: "d2:addControlDigits", parameters: 1},
          {name: "d2:checkControlDigits", parameters: 1}];
        var continueLooping = true;
        //Safety harness on 10 loops, in case of unanticipated syntax causing unintencontinued looping
        for (var i = 0; i < 10 && continueLooping; i++) {
          var successfulExecution = false;
          angular.forEach(dhisFunctions, function (dhisFunction) {
            //Select the function call, with any number of parameters inside single quotations, or number parameters witout quotations
            var regularExFunctionCall = new RegExp(dhisFunction.name + "\\( *(([\\d/\\*\\+\\-%\.]+)|( *'[^']*'))*( *, *(([\\d/\\*\\+\\-%\.]+)|'[^']*'))* *\\)", 'g');
            var callsToThisFunction = expression.match(regularExFunctionCall);
            angular.forEach(callsToThisFunction, function (callToThisFunction) {
              //Remove the function name and paranthesis:
              var justparameters = callToThisFunction.replace(/(^[^\(]+\()|\)$/g, "");
              //Then split into single parameters:
              var parameters = justparameters.match(/(('[^']+')|([^,]+))/g);

              //Show error if no parameters is given and the function requires parameters,
              //or if the number of parameters is wrong.
              if (angular.isDefined(dhisFunction.parameters)) {
                //But we are only checking parameters where the dhisFunction actually has a defined set of parameters(concatenate, for example, does not have a fixed number);
                if ((!angular.isDefined(parameters) && dhisFunction.parameters > 0)
                  || parameters.length !== dhisFunction.parameters) {
                  //$log.warn(dhisFunction.name + " was called with the incorrect number of parameters");
                }
              }

              //In case the function call is nested, the parameter itself contains an expression, run the expression.
              if (angular.isDefined(parameters)) {
                for (var i = 0; i < parameters.length; i++) {
                  parameters[i] = runExpression(parameters[i], dhisFunction.name, "parameter:" + i, flag, variablesHash);
                }
              }

              //Special block for d2:weeksBetween(*,*) - add such a block for all other dhis functions.
              if (dhisFunction.name === "d2:daysBetween") {
                var firstdate = $filter('d2fTrimQuotes')(parameters[0]);
                var seconddate = $filter('d2fTrimQuotes')(parameters[1]);
                firstdate = moment(firstdate);
                seconddate = moment(seconddate);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'days'));
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:weeksBetween") {
                var firstdate = $filter('d2fTrimQuotes')(parameters[0]);
                var seconddate = $filter('d2fTrimQuotes')(parameters[1]);
                firstdate = moment(firstdate);
                seconddate = moment(seconddate);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'weeks'));
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:monthsBetween") {
                var firstdate = $filter('d2fTrimQuotes')(parameters[0]);
                var seconddate = $filter('d2fTrimQuotes')(parameters[1]);
                firstdate = moment(firstdate);
                seconddate = moment(seconddate);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'months'));
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:yearsBetween") {
                var firstdate = $filter('d2fTrimQuotes')(parameters[0]);
                var seconddate = $filter('d2fTrimQuotes')(parameters[1]);
                firstdate = moment(firstdate);
                seconddate = moment(seconddate);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'years'));
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:floor") {
                var floored = Math.floor(parameters[0]);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, floored);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:modulus") {
                var dividend = Number(parameters[0]);
                var divisor = Number(parameters[1]);
                var rest = dividend % divisor;
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, rest);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:concatenate") {
                var returnString = "'";
                for (var i = 0; i < parameters.length; i++) {
                  returnString += parameters[i];
                }
                returnString += "'";
                expression = expression.replace(callToThisFunction, returnString);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:addDays") {
                var date = $filter('d2fTrimQuotes')(parameters[0]);
                var daystoadd = $filter('d2fTrimQuotes')(parameters[1]);
                var newdate = d2sDateUtils.addDays2DateYYMMDD(date, daystoadd);
                var newdatestring = "'" + newdate + "'";
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, newdatestring);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:zing") {
                var number = parameters[0];
                if (number < 0) {
                  number = 0;
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, number);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:oizp") {
                var number = parameters[0];
                var output = 1;
                if (number < 0) {
                  output = 0;
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, output);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:count") {
                var variableName = parameters[0];
                var variableObject = variablesHash[variableName];
                var count = 0;
                if (variableObject) {
                  if (variableObject.hasValue) {
                    if (variableObject.allValues) {
                      count = variableObject.allValues.length;
                    } else {
                      //If there is a value found for the variable, the count is 1 even if there is no list of alternate values
                      //This happens for variables of "DATAELEMENT_CURRENT_STAGE" and "TEI_ATTRIBUTE"
                      count = 1;
                    }
                  }
                }
                else {
                  //$log.warn("could not find variable to count: " + variableName);
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, count);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:countIfZeroPos") {
                var variableName = $filter('d2fTrimVariableQualifiers')(parameters[0]);
                var variableObject = variablesHash[variableName];

                var count = 0;
                if (variableObject) {
                  if (variableObject.hasValue) {
                    if (variableObject.allValues && variableObject.allValues.length > 0) {
                      for (var i = 0; i < variableObject.allValues.length; i++) {
                        if (variableObject.allValues[i] >= 0) {
                          count++;
                        }
                      }
                    }
                    else {
                      //The variable has a value, but no list of alternates. This means we only compare the elements real value
                      if (variableObject.variableValue >= 0) {
                        count = 1;
                      }
                    }
                  }
                }
                else {
                  //$log.warn("could not find variable to countifzeropos: " + variableName);
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, count);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:countIfValue") {
                var variableName = parameters[0];
                var variableObject = variablesHash[variableName];

                var valueToCompare = d2sVariableService.processValue(parameters[1], variableObject.variableType);

                var count = 0;
                if (variableObject) {
                  if (variableObject.hasValue) {
                    if (variableObject.allValues) {
                      for (var i = 0; i < variableObject.allValues.length; i++) {
                        if (valueToCompare === variableObject.allValues[i]) {
                          count++;
                        }
                      }
                    } else {
                      //The variable has a value, but no list of alternates. This means we compare the standard variablevalue
                      if (valueToCompare === variableObject.variableValue) {
                        count = 1;
                      }
                    }

                  }
                }
                else {
                  //$log.warn("could not find variable to countifvalue: " + variableName);
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, count);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:ceil") {
                var ceiled = Math.ceil(parameters[0]);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, ceiled);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:round") {
                var rounded = Math.round(parameters[0]);
                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, rounded);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:hasValue") {
                var variableName = parameters[0];
                var variableObject = variablesHash[variableName];
                var valueFound = false;
                if (variableObject) {
                  if (variableObject.hasValue) {
                    valueFound = true;
                  }
                }
                else {
                  //$log.warn("could not find variable to check if has value: " + variableName);
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, valueFound);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:lastEventDate") {
                var variableName = parameters[0];
                var variableObject = variablesHash[variableName];
                var valueFound = "''";
                if (variableObject) {
                  if (variableObject.variableEventDate) {
                    valueFound = d2sVariableService.processValue(variableObject.variableEventDate, 'DATE');
                  }
                  else {
                    //$log.warn("no last event date found for variable: " + variableName);
                  }
                }
                else {
                  //$log.warn("could not find variable to check last event date: " + variableName);
                }

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, valueFound);
                successfulExecution = true;
              }
              else if (dhisFunction.name === "d2:addControlDigits") {

                var baseNumber = parameters[0];
                var baseDigits = baseNumber.split('');
                var error = false;


                var firstDigit = 0;
                var secondDigit = 0;

                if (baseDigits && baseDigits.length < 10) {
                  var firstSum = 0;
                  var baseNumberLength = baseDigits.length;
                  //weights support up to 9 base digits:
                  var firstWeights = [3, 7, 6, 1, 8, 9, 4, 5, 2];
                  for (var i = 0; i < baseNumberLength && !error; i++) {
                    firstSum += parseInt(baseDigits[i]) * firstWeights[i];
                  }
                  firstDigit = firstSum % 11;

                  //Push the first digit to the array before continuing, as the second digit is a result of the
                  //base digits and the first control digit.
                  baseDigits.push(firstDigit);
                  //Weights support up to 9 base digits plus first control digit:
                  var secondWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
                  var secondSum = 0;
                  for (var i = 0; i < baseNumberLength + 1 && !error; i++) {
                    secondSum += parseInt(baseDigits[i]) * secondWeights[i];
                  }
                  secondDigit = secondSum % 11;

                  if (firstDigit === 10) {
                    //$log.warn("First control digit became 10, replacing with 0");
                    firstDigit = 0;
                  }
                  if (secondDigit === 10) {
                    //$log.warn("Second control digit became 10, replacing with 0");
                    secondDigit = 0;
                  }
                }
                else {
                  //$log.warn("Base nuber not well formed(" + baseNumberLength + " digits): " + baseNumber);
                }

                if (!error) {
                  //Replace the end evaluation of the dhis function:
                  expression = expression.replace(callToThisFunction, baseNumber + firstDigit + secondDigit);
                  successfulExecution = true;
                }
                else {
                  //Replace the end evaluation of the dhis function:
                  expression = expression.replace(callToThisFunction, baseNumber);
                  successfulExecution = false;
                }
              }
              else if (dhisFunction.name === "d2:checkControlDigits") {
                //$log.warn("checkControlDigits not implemented yet");

                //Replace the end evaluation of the dhis function:
                expression = expression.replace(callToThisFunction, parameters[0]);
                successfulExecution = false;
              }
            });
          });

          //We only want to continue looping until we made a successful replacement,
          //and there is still occurrences of "d2:" in the code. In cases where d2: occur outside
          //the expected d2: function calls, one unneccesary iteration will be done and the
          //successfulExecution will be false coming back here, ending the loop. The last iteration
          //should be zero to marginal performancewise.
          if (successfulExecution && expression.indexOf("d2:") !== -1) {
            continueLooping = true;
          } else {
            continueLooping = false;
          }
        }
      }

      return expression;
    };

    var runExpression = function (expression, beforereplacement, identifier, flag, variablesHash) {
      //determine if expression is true, and actions should be effectuated
      //If DEBUG mode, use try catch and report errors. If not, omit the heavy try-catch loop.:
      var answer = false;
      if (flag.debug) {
        try {

          var dhisfunctionsevaluated = runDhisFunctions(expression, variablesHash, flag);
          answer = eval(dhisfunctionsevaluated);

          if (flag.verbose) {
            //$log.info("Expression with id " + identifier + " was successfully run. Original condition was: " + beforereplacement + " - Evaluation ended up as:" + expression + " - Result of evaluation was:" + answer);
          }
        }
        catch (e) {
          //$log.warn("Expression with id " + identifier + " could not be run. Original condition was: " + beforereplacement + " - Evaluation ended up as:" + expression + " - error message:" + e);
        }
      }
      else {
        //Just run the expression. This is much faster than the debug route: http://jsperf.com/try-catch-block-loop-performance-comparison
        var dhisfunctionsevaluated = runDhisFunctions(expression, variablesHash, flag);
        answer = eval(dhisfunctionsevaluated);
      }
      if (dhis2.validation.isNumber(answer)) {
        answer = Math.round(answer * 100) / 100;
      }
      return answer;
    };

    var determineValueType = function (value) {
      var valueType = 'TEXT';
      if (value === 'true' || value === 'false') {
        valueType = 'BOOLEAN';
      }
      else if (angular.isNumber(value) || !isNaN(value)) {
        if (value % 1 !== 0) {
          valueType = 'NUMBER';
        }
        else {
          valueType = 'INTEGER';
        }
      }
      return valueType;
    };

    var performCreateEventAction = function (effect, selectedEntity, selectedEnrollment, currentEvents) {
      var valArray = [];
      if (effect.data) {
        valArray = effect.data.split(',');
        var dataValues = [];
        angular.forEach(valArray, function (value) {
          var valParts = value.split(':');
          if (valParts && valParts.length >= 1) {
            var valId = valParts[0];
            var valVal = "";
            if (valParts.length > 1) {
              valVal = valParts[1];
            }
            var valueType = determineValueType(valVal);

            var processedValue = d2sVariableService.processValue(valVal, valueType);
            processedValue = $filter('d2fTrimQuotes')(processedValue);
            dataValues.push({dataElement: valId, value: processedValue});
            dataValues[valId] = processedValue;
          }
        });

        var valuesAlreadyExists = false;
        angular.forEach(currentEvents, function (currentEvent) {
          var misMatch = false;
          angular.forEach(dataValues, function (value) {
            if (currentEvent[value.dataElement] !== dataValues[value.dataElement]) {
              misMatch = true;
            }
          });
          if (!misMatch) {
            //if no mismatches on this point, the exact same event already exists, and we dont create it.
            valuesAlreadyExists = true;
          }
        });

        if (!valuesAlreadyExists) {
          var eventDate = d2sDateUtils.getToday();
          var dueDate = d2sDateUtils.getToday();

          var newEvent = {
            trackedEntityInstance: selectedEnrollment.trackedEntityInstance,
            program: selectedEnrollment.program,
            programStage: effect.programStage.id,
            enrollment: selectedEnrollment.enrollment,
            orgUnit: selectedEnrollment.orgUnit,
            dueDate: dueDate,
            eventDate: eventDate,
            notes: [],
            dataValues: dataValues,
            status: 'ACTIVE',
            event: dhis2.util.uid()
          };

          d2sEventFactory.create(newEvent).then(function (result) {
            $rootScope.$broadcast("eventcreated", {event: newEvent});
          });
          //1 event created
          return 1;
        }
        else {
          //no events created
          return 0;
        }
      } else {
        //$log.warn("Cannot create event with empty content.");
      }
    };

    return {
      executeRules: function (allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, flag) {
        if (allProgramRules) {
          var variablesHash = {};

          //Concatenate rules produced by indicator definitions into the other rules:
          var rules = $filter('filter')(allProgramRules.programRules, {programStageId: null});

          if (executingEvent.programStage) {
            if (!rules) {
              rules = [];
            }
            rules = rules.concat($filter('filter')(allProgramRules.programRules, {programStageId: executingEvent.programStage}));
          }
          if (!rules) {
            rules = [];
          }
          rules = rules.concat(allProgramRules.programIndicators.rules);

          //Run rules in priority - lowest number first(priority null is last)
          rules = orderByFilter(rules, 'priority');

          variablesHash = d2sVariableService.getVariables(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment);

          if (angular.isObject(rules) && angular.isArray(rules)) {
            //The program has rules, and we want to run them.
            //Prepare repository unless it is already prepared:
            if (angular.isUndefined($rootScope.ruleeffects)) {
              $rootScope.ruleeffects = {};
            }

            var ruleEffectKey = executingEvent.event ? executingEvent.event : executingEvent;
            if (executingEvent.event && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
              $rootScope.ruleeffects[ruleEffectKey] = {};
            }

            if (!angular.isObject(executingEvent) && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
              $rootScope.ruleeffects[ruleEffectKey] = {};
            }

            var updatedEffectsExits = false;
            var eventsCreated = 0;

            angular.forEach(rules, function (rule) {
              var ruleEffective = false;

              var expression = rule.condition;
              //Go through and populate variables with actual values, but only if there actually is any replacements to be made(one or more "$" is present)
              if (expression) {
                if (expression.indexOf('{') !== -1) {
                  expression = replaceVariables(expression, variablesHash);
                }
                //run expression:
                ruleEffective = runExpression(expression, rule.condition, "rule:" + rule.id, flag, variablesHash);
              } else {
                //$log.warn("Rule id:'" + rule.id + "'' and name:'" + rule.name + "' had no condition specified. Please check rule configuration.");
              }

              angular.forEach(rule.programRuleActions, function (action) {
                //In case the effect-hash is not populated, add entries
                if (angular.isUndefined($rootScope.ruleeffects[ruleEffectKey][action.id])) {
                  $rootScope.ruleeffects[ruleEffectKey][action.id] = {
                    id: action.id,
                    location: action.location,
                    action: action.programRuleActionType,
                    dataElement: action.dataElement,
                    trackedEntityAttribute: action.trackedEntityAttribute,
                    programStage: action.programStage,
                    programIndicator: action.programIndicator,
                    programStageSection: action.programStageSection && action.programStageSection.id ? action.programStageSection.id : null,
                    content: action.content,
                    data: action.data,
                    ineffect: undefined
                  };
                }

                //In case the rule is effective and contains specific data,
                //the effect be refreshed from the variables list.
                //If the rule is not effective we can skip this step
                if (ruleEffective && action.data) {
                  //Preserve old data for comparison:
                  var oldData = $rootScope.ruleeffects[ruleEffectKey][action.id].data;

                  //The key data might be containing a dollar sign denoting that the key data is a variable.
                  //To make a lookup in variables hash, we must make a lookup without the dollar sign in the variable name
                  //The first strategy is to make a direct lookup. In case the "data" expression is more complex, we have to do more replacement and evaluation.

                  var nameWithoutBrackets = action.data.replace('#{', '').replace('}', '');
                  if (angular.isDefined(variablesHash[nameWithoutBrackets])) {
                    //The variable exists, and is replaced with its corresponding value
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data =
                      variablesHash[nameWithoutBrackets].variableValue;
                  }
                  else if (action.data.indexOf('{') !== -1 || action.data.indexOf('d2:') !== -1) {
                    //Since the value couldnt be looked up directly, and contains a curly brace or a dhis function call,
                    //the expression was more complex than replacing a single variable value.
                    //Now we will have to make a thorough replacement and separate evaluation to find the correct value:
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data = replaceVariables(action.data, variablesHash);
                    //In a scenario where the data contains a complex expression, evaluate the expression to compile(calculate) the result:
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data = runExpression($rootScope.ruleeffects[ruleEffectKey][action.id].data, action.data, "action:" + action.id, flag, variablesHash);
                  }

                  if (oldData !== $rootScope.ruleeffects[ruleEffectKey][action.id].data) {
                    updatedEffectsExits = true;
                  }
                }

                //Update the rule effectiveness if it changed in this evaluation;
                if ($rootScope.ruleeffects[ruleEffectKey][action.id].ineffect !== ruleEffective) {
                  //There is a change in the rule outcome, we need to update the effect object.
                  updatedEffectsExits = true;
                  $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect = ruleEffective;
                }

                //In case the rule is of type CREATEEVENT, run event creation:
                if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "CREATEEVENT" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
                  if (evs && evs.byStage && evs.byStage[$rootScope.ruleeffects[ruleEffectKey]] && evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id]]) {
                    if (evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id].programStage]) {
                      eventsCreated += performCreateEventAction($rootScope.ruleeffects[ruleEffectKey][action.id], selectedEntity, selectedEnrollment, evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id].programStage.id]);
                    } else {
                      //$log.warn("No programstage defined for CREATEEVENT action: " + action.id);
                    }
                  } else {
                    //$log.warn("Events to evaluate for CREATEEVENT action: " + action.id + ". Could it have been triggered at the wrong time or during registration?");
                  }

                }
                //In case the rule is of type "assign variable" and the rule is effective,
                //the variable data result needs to be applied to the correct variable:
                else if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "ASSIGN" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
                  //from earlier evaluation, the data portion of the ruleeffect now contains the value of the variable to be assign.
                  //the content portion of the ruleeffect defines the name for the variable, when dollar is removed:
                  var variabletoassign = $rootScope.ruleeffects[ruleEffectKey][action.id].content ?
                    $rootScope.ruleeffects[ruleEffectKey][action.id].content.replace("#{", "").replace("}", "") : null;

                  if ((!variabletoassign || !angular.isDefined(variablesHash[variabletoassign])) && !$rootScope.ruleeffects[ruleEffectKey][action.id].dataElement) {
                    //$log.warn("Variable " + variabletoassign + " was not defined.");
                  }

                  var updatedValue = $rootScope.ruleeffects[ruleEffectKey][action.id].data;

                  //Even if the variable is not defined: we assign it:
                  if (variablesHash[variabletoassign] &&
                    variablesHash[variabletoassign].variableValue !== updatedValue) {
                    //If the variable was actually updated, we assume that there is an updated ruleeffect somewhere:
                    updatedEffectsExits = true;
                    //Then we assign the new value:
                    var valueType = determineValueType(updatedValue);

                    var processedValue = d2sVariableService.processValue(updatedValue, valueType);

                    variablesHash[variabletoassign] = {
                      variableValue: processedValue,
                      variableType: valueType,
                      hasValue: true,
                      variableEventDate: '',
                      variablePrefix: '#',
                      allValues: [processedValue]
                    };
                  }
                }
              });
            });

            //Broadcast rules finished if there was any actual changes to the event.
            if (updatedEffectsExits) {
              $rootScope.$broadcast("ruleeffectsupdated", {event: ruleEffectKey, eventsCreated: eventsCreated});
            }
          }

          return true;
        }
      },

      executeRulesBID: function (allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, flag) {
        if (allProgramRules) {
          var variablesHash = {};

          //Concatenate rules produced by indicator definitions into the other rules:
          var rules = $filter('filter')(allProgramRules.programRules, {programStageId: null});

          if (executingEvent.programStage) {
            if (!rules) {
              rules = [];
            }
            rules = rules.concat($filter('filter')(allProgramRules.programRules, {programStageId: executingEvent.programStage}));
          }
          if (!rules) {
            rules = [];
          }
          rules = rules.concat(allProgramRules.programIndicators.rules);

          //Run rules in priority - lowest number first(priority null is last)
          rules = orderByFilter(rules, 'priority');

          variablesHash = d2sVariableService.getVariables(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment);

          if (angular.isObject(rules) && angular.isArray(rules)) {
            //The program has rules, and we want to run them.
            //Prepare repository unless it is already prepared:
            if (angular.isUndefined($rootScope.ruleeffects)) {
              $rootScope.ruleeffects = {};
            }

            var ruleEffectKey = executingEvent.event ? executingEvent.event : executingEvent;
            if (executingEvent.event && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
              $rootScope.ruleeffects[ruleEffectKey] = {};
            }

            if (!angular.isObject(executingEvent) && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
              $rootScope.ruleeffects[ruleEffectKey] = {};
            }

            var updatedEffectsExits = false;
            var eventsCreated = 0;

            angular.forEach(rules, function (rule) {
              var ruleEffective = false;

              var expression = rule.condition;
              //Go through and populate variables with actual values, but only if there actually is any replacements to be made(one or more "$" is present)
              if (expression) {
                if (expression.indexOf('{') !== -1) {
                  expression = replaceVariables(expression, variablesHash);
                }

                //run expression:
                ruleEffective = runExpression(expression, rule.condition, "rule:" + rule.id, flag, variablesHash);
              } else {
                //$log.warn("Rule id:'" + rule.id + "'' and name:'" + rule.name + "' had no condition specified. Please check rule configuration.");
              }

              angular.forEach(rule.programRuleActions, function (action) {
                //In case the effect-hash is not populated, add entries
                if (angular.isUndefined($rootScope.ruleeffects[ruleEffectKey][action.id])) {
                  $rootScope.ruleeffects[ruleEffectKey][action.id] = {
                    id: action.id,
                    location: action.location,
                    action: action.programRuleActionType,
                    dataElement: action.dataElement,
                    trackedEntityAttribute: action.trackedEntityAttribute,
                    programStage: action.programStage,
                    programIndicator: action.programIndicator,
                    programStageSection: action.programStageSection && action.programStageSection.id ? action.programStageSection.id : null,
                    content: action.content,
                    data: action.data,
                    ineffect: undefined
                  };
                }

                //In case the rule is effective and contains specific data,
                //the effect be refreshed from the variables list.
                //If the rule is not effective we can skip this step
                if (ruleEffective && action.data) {
                  //Preserve old data for comparison:
                  var oldData = $rootScope.ruleeffects[ruleEffectKey][action.id].data;

                  //The key data might be containing a dollar sign denoting that the key data is a variable.
                  //To make a lookup in variables hash, we must make a lookup without the dollar sign in the variable name
                  //The first strategy is to make a direct lookup. In case the "data" expression is more complex, we have to do more replacement and evaluation.

                  var nameWithoutBrackets = action.data.replace('#{', '').replace('}', '');
                  if (angular.isDefined(variablesHash[nameWithoutBrackets])) {
                    //The variable exists, and is replaced with its corresponding value
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data =
                      variablesHash[nameWithoutBrackets].variableValue;
                  }
                  else if (action.data.indexOf('{') !== -1 || action.data.indexOf('d2:') !== -1) {
                    //Since the value couldnt be looked up directly, and contains a curly brace or a dhis function call,
                    //the expression was more complex than replacing a single variable value.
                    //Now we will have to make a thorough replacement and separate evaluation to find the correct value:
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data = replaceVariables(action.data, variablesHash);
                    //In a scenario where the data contains a complex expression, evaluate the expression to compile(calculate) the result:
                    $rootScope.ruleeffects[ruleEffectKey][action.id].data = runExpression($rootScope.ruleeffects[ruleEffectKey][action.id].data, action.data, "action:" + action.id, flag, variablesHash);
                  }

                  if (oldData !== $rootScope.ruleeffects[ruleEffectKey][action.id].data) {
                    updatedEffectsExits = true;
                  }
                }

                //Update the rule effectiveness if it changed in this evaluation;
                if ($rootScope.ruleeffects[ruleEffectKey][action.id].ineffect !== ruleEffective) {
                  //There is a change in the rule outcome, we need to update the effect object.
                  updatedEffectsExits = true;
                  $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect = ruleEffective;
                }

                //In case the rule is of type CREATEEVENT, run event creation:
                if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "CREATEEVENT" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
                  if (evs && evs.byStage && evs.byStage[$rootScope.ruleeffects[ruleEffectKey]] && evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id]]) {
                    if (evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id].programStage]) {
                      eventsCreated += performCreateEventAction($rootScope.ruleeffects[ruleEffectKey][action.id], selectedEntity, selectedEnrollment, evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id].programStage.id]);
                    } else {
                      //$log.warn("No programstage defined for CREATEEVENT action: " + action.id);
                    }
                  } else {
                    //$log.warn("Events to evaluate for CREATEEVENT action: " + action.id + ". Could it have been triggered at the wrong time or during registration?");
                  }

                }
                //In case the rule is of type "assign variable" and the rule is effective,
                //the variable data result needs to be applied to the correct variable:
                else if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "ASSIGN" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
                  //from earlier evaluation, the data portion of the ruleeffect now contains the value of the variable to be assign.
                  //the content portion of the ruleeffect defines the name for the variable, when dollar is removed:
                  var variabletoassign = $rootScope.ruleeffects[ruleEffectKey][action.id].content ?
                    $rootScope.ruleeffects[ruleEffectKey][action.id].content.replace("#{", "").replace("}", "") : null;

                  if ((!variabletoassign || !angular.isDefined(variablesHash[variabletoassign])) && !$rootScope.ruleeffects[ruleEffectKey][action.id].dataElement) {
                    //$log.warn("Variable " + variabletoassign + " was not defined.");
                  }

                  var updatedValue = $rootScope.ruleeffects[ruleEffectKey][action.id].data;

                  //Even if the variable is not defined: we assign it:
                  if (variablesHash[variabletoassign] &&
                    variablesHash[variabletoassign].variableValue !== updatedValue) {
                    //If the variable was actually updated, we assume that there is an updated ruleeffect somewhere:
                    updatedEffectsExits = true;
                    //Then we assign the new value:
                    var valueType = determineValueType(updatedValue);

                    var processedValue = d2sVariableService.processValue(updatedValue, valueType);

                    variablesHash[variabletoassign] = {
                      variableValue: processedValue,
                      variableType: valueType,
                      hasValue: true,
                      variableEventDate: '',
                      variablePrefix: '#',
                      allValues: [processedValue]
                    };
                  }
                }
              });
            });

            //Broadcast rules finished if there was any actual changes to the event.
            //if(updatedEffectsExits){
            //    $rootScope.$broadcast("ruleeffectsupdated", { event: ruleEffectKey, eventsCreated:eventsCreated });
            //}
          }

          return {event: executingEvent, ruleeffects: $rootScope.ruleeffects[ruleEffectKey]};
        }
      }
    };
  })

  /* service for dealing with events */
  .service('d2sEventService', function () {
    return {
      //for simplicity of grid display, events were changed from
      //event.datavalues = [{dataElement: dataElement, value: value}] to
      //event[dataElement] = value
      //now they are changed back for the purpose of storage.
      reconstructEvent: function (event, programStageDataElements) {
        var e = {};

        e.event = event.event;
        e.status = event.status;
        e.program = event.program;
        e.programStage = event.programStage;
        e.orgUnit = event.orgUnit;
        e.eventDate = event.eventDate;

        var dvs = [];
        angular.forEach(programStageDataElements, function (prStDe) {
          if (event.hasOwnProperty(prStDe.dataElement.id)) {
            dvs.push({dataElement: prStDe.dataElement.id, value: event[prStDe.dataElement.id]});
          }
        });

        e.dataValues = dvs;

        if (event.coordinate) {
          e.coordinate = {
            latitude: event.coordinate.latitude ? event.coordinate.latitude : '',
            longitude: event.coordinate.longitude ? event.coordinate.longitude : ''
          };
        }

        return e;
      },
      refreshList: function (eventList, currentEvent) {
        if (!eventList || !eventList.length) {
          return;
        }
        var continueLoop = true;
        for (var i = 0; i < eventList.length && continueLoop; i++) {
          if (eventList[i].event === currentEvent.event) {
            eventList[i] = currentEvent;
            continueLoop = false;
          }
        }
        return eventList;
      }
    };
  })

  /* factory for handling events */
  .factory('d2sEventFactory', function ($http, $translate) {

    return {

      getEventsByStatus: function (entity, orgUnit, program, programStatus) {
        var promise = $http.get('../api/events.json?ouMode=ACCESSIBLE&' + 'trackedEntityInstance=' + entity + '&orgUnit=' + orgUnit + '&program=' + program + '&programStatus=' + programStatus + '&paging=false').then(function (response) {
          return response.data.events;
        });
        return promise;
      },
      getEventsByProgram: function (entity, program) {

        var url = '../api/events.json?ouMode=ACCESSIBLE&' + 'trackedEntityInstance=' + entity + '&paging=false';
        if (program) {
          url = url + '&program=' + program;
        }
        var promise = $http.get(url).then(function (response) {
          return response.data.events;
        });
        return promise;
      },
      getEventsByProgramStage: function (entity, programStage) {
        var url = '../api/events.json?ouMode=ACCESSIBLE&' + 'trackedEntityInstance=' + entity + '&paging=false';
        if (programStage) {
          url += '&programStage=' + programStage;
        }
        var promise = $http.get(url).then(function (response) {
          return response.data.events;
        });
        return promise;
      },
      getByOrgUnitAndProgram: function (orgUnit, ouMode, program, startDate, endDate) {
        var url;
        if (startDate && endDate) {
          url = '../api/events.json?' + 'orgUnit=' + orgUnit + '&ouMode=' + ouMode + '&program=' + program + '&startDate=' + startDate + '&endDate=' + endDate + '&paging=false';
        }
        else {
          url = '../api/events.json?' + 'orgUnit=' + orgUnit + '&ouMode=' + ouMode + '&program=' + program + '&paging=false';
        }
        var promise = $http.get(url).then(function (response) {
          return response.data.events;
        }, function (response) {
          if (response && response.data && response.data.status === 'ERROR') {
            var dialogOptions = {
              headerText: response.data.status,
              bodyText: response.data.message ? response.data.message : $translate.instant('unable_to_fetch_data_from_server')
            };
          }
        });
        return promise;
      },
      get: function (eventUid) {
        var promise = $http.get('../api/events/' + eventUid + '.json').then(function (response) {
          return response.data;
        });
        return promise;
      },
      create: function (dhis2Event) {
        var promise = $http.post('../api/events.json', dhis2Event).then(function (response) {
          return response.data;
        });
        return promise;
      },
      delete: function (dhis2Event) {
        var promise = $http.delete('../api/events/' + dhis2Event.event).then(function (response) {
          return response.data;
        });
        return promise;
      },
      update: function (dhis2Event) {
        var promise = $http.put('../api/events/' + dhis2Event.event, dhis2Event).then(function (response) {
          return response.data;
        });
        return promise;
      },
      updateForSingleValue: function (singleValue) {
        var promise = $http.put('../api/events/' + singleValue.event + '/' + singleValue.dataValues[0].dataElement, singleValue).then(function (response) {
          return response.data;
        });
        return promise;
      },
      updateForNote: function (dhis2Event) {
        var promise = $http.post('../api/events/' + dhis2Event.event + '/note', dhis2Event).then(function (response) {
          return response.data;
        });
        return promise;
      },
      updateForEventDate: function (dhis2Event) {
        var promise = $http.put('../api/events/' + dhis2Event.event + '/eventDate', dhis2Event).then(function (response) {
          return response.data;
        });
        return promise;
      }
    };
  });
