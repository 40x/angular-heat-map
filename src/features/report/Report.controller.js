(function() {
    'use strict';

    angular.module('uiTrack').controller('ReportController', ReportController );

    ReportController.$inject = ['mapStore'];

    function ReportController (mapStore) {
        var Vm = this;

        var chartData = [];

        if(mapStore.db) {
            _.each(mapStore.db, function(state, i) {
                var clicked = 0;
                //if this state contains a click event push it to chart data
                if(state['click']) {
                    var data = {};
                    data.label = i;
                    //count the number of click events in this state
                    _.each(state['click'], function() {
                        clicked++;
                    });
                    data.value = clicked;
                    chartData.push(data);
                }
            });

            Vm.dataToBePlotted = [
                {
                    "key": "Series 1",
                    "values":  chartData
                }
            ];
        }

        Vm.reportOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                width: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'States'
                },
                yAxis: {
                    axisLabel: 'Number of clicks',
                    axisLabelDistance: 30
                }
            }
        };

    }

})();