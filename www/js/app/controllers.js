angular.module('app.controllers', [])

  .controller('cBidReportAppCtrl', function ($scope, mInitdata, mCODE, sInitDataService, sConfigVariableApp) {
    if (angular.isUndefined(mInitdata.initial)) {
      sConfigVariableApp.initApp(mCODE.EVN.DEV);
      sInitDataService.initCommonDB();
      mInitdata.initial = true;
      sInitDataService.mockupDB();
    }
  })

  .controller('cScheduleVaccineTodayCtrl', function ($scope, sRuleHelper, mDataCommon) {
    var rulesEffect = sRuleHelper.excuteRules();
    var programStageDataElementsMap = sRuleHelper.programStageDataElementsMap();

    //populate completed data values.
    var dataValues = [];
    angular.forEach(mDataCommon.eventsTEI, function (event) {
      angular.forEach(event.dataValues, function (dataValue) {
        dataValues[dataValue.dataElement] = dataValue;
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

    for (var key in programStageDataElementsMap) {
      var programStageDataElement = programStageDataElementsMap[key];
      if (dataValues[key] && programStageDataElement.dataElement.value == undefined) {
        programStageDataElement.dataElement.value = dataValues[key].value;
      }
      if (programStageDataElement.dataElement.value != undefined || programStageDataElement["action"] != "hidden") {
        console.log("key = " + key + " - name: " + programStageDataElement.dataElement.name + " - value: " + (programStageDataElement.dataElement.value ?
            programStageDataElement.dataElement.value : (dataValues[key] ? dataValues[key].value : undefined)));
      }
    }
  })

  .controller('cStockInHandCtrl', function ($scope) {

    $(function () {
      $('#container').highcharts({
        title: {
          text: 'Monthly Average Temperature',
          x: -20 //center
        },
        subtitle: {
          text: 'Source: WorldClimate.com',
          x: -20
        },
        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
          title: {
            text: 'Temperature (°C)'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: '°C'
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0
        },
        series: [{
          name: 'Tokyo',
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
          name: 'New York',
          data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
          name: 'Berlin',
          data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
          name: 'London',
          data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
      });
    });


  })

  .controller('cStockInHandVsDemandCtrl', function ($scope) {

    $(function () {
      $(document).ready(function () {
        Highcharts.setOptions({
          global: {
            useUTC: false
          }
        });

        $('#container').highcharts({
          chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
              load: function () {

                // set up the updating of the chart each second
                var series = this.series[0];
                setInterval(function () {
                  var x = (new Date()).getTime(), // current time
                    y = Math.random();
                  series.addPoint([x, y], true, true);
                }, 1000);
              }
            }
          },
          title: {
            text: 'Live random data'
          },
          xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
          },
          yAxis: {
            title: {
              text: 'Value'
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },
          tooltip: {
            formatter: function () {
              return '<b>' + this.series.name + '</b><br/>' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                Highcharts.numberFormat(this.y, 2);
            }
          },
          legend: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          series: [{
            name: 'Random data',
            data: (function () {
              // generate an array of random data
              var data = [],
                time = (new Date()).getTime(),
                i;

              for (i = -19; i <= 0; i += 1) {
                data.push({
                  x: time + i * 1000,
                  y: Math.random()
                });
              }
              return data;
            }())
          }]
        });
      });
    });

  })

  .controller('cVaccineHistoryReportCtrl', function ($scope) {
    
  })

  .controller('cLoginCtrl', function ($scope) {

  })
