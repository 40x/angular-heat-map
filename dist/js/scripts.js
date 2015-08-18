(function() {
    angular
        .module('DemoApp', ['ui.router', 'ngCsv','nvd3','ui.bootstrap'])

        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
                name: 'home',
                url: '/home',
                template: '<div class="tab tab1">\n    <p>\n        The purpose of this application is to be able to track the interaction of the users with the application on a given device. \n        This gives the development/management team a better insight into what the end user actually uses and to what extent, this leads to better\n        design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions\n        at the state level for better analysis of the data.\n    </p>\n</div>'
            })

            .state('future', {
                name: 'future',
                url: '/future',
                template: '<div class="tab tab2">\n    <p>The future scope of this application can be extended to provide predictive analysis on what parts of the application are being used \n        to their highest extent and which ones could be modified for a better user experience. We plan on using javascript/java based neural \n        network for analyzing the user interaction, but because of the nature of the data set being used (mostly because it is small) the \n        training system is erroneous, we plan on overcoming it by collecting a larger set of data.\n    </p>\n    <p>\n        Another challenge that we have identified is to show the activity pertaining to hover events like dropdowns, modal and any other dom \n        element that does not persist on the screen. We plan on recording the user activity end to end and replay the whole activity to avoid\n        any gap in data. The biggest challenge here would be to overcome the involuntary XSS feature implemented by the browsers.\n    </p>\n    <p>\n        For the future scope of the project we also plan on implementing the following:\n        <ul>\n            <li>\n                Number of events occurred on each page of the application        \n            </li>\n            <li>\n                Event frequency based on time of the day.\n            </li>\n            <li>\n                Demographic segregation of events.\n            </li>\n            <li>\n                Create a super set of high quality data that serves as the main data source for future predictions\n            </li>\n        </ul>\n    </p>\n</div>'
            })

            .state('performance', {
                name: 'performance',
                url: '/performance',
                template: '<div class="tab tab3"><p>One of the primary risks that we expected to come accross while building this app was the performance. Primarily because of the nature of the tasks being performed by the tool which are considered to be DOM heavy, however we have employed some HPC javascript libraries to help us overcome this problem. Apart from the sluggy DOM, another major concern is the digest cycle and watchers, the tool is built in such a way that the digest cycle is relatively inexpensive. The only watchers that are being set right now are demo specific. </p></div>'
            })

    }
})();
(function() {
    'use strict';

    angular.module('DemoApp').controller('DemoController', DemoController );

    DemoController.$inject = ['mapStore', '$state'];

    function DemoController (mapStore, $state) {
        var demoVm = this;
    }

})();
(function() {
    'use strict';

    angular.module('DemoApp').controller('ReportController', ReportController );

    ReportController.$inject = ['mapStore'];

    function ReportController (mapStore) {
        var Vm = this;

        var chartData = [];

        if(mapStore.db) {
            console.log('map ',mapStore.db);
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
(function() {
    angular
        .module('DemoApp').directive('uiTrack', heatMap);

    heatMap.$inject = ['$document', '$state', 'mapStore', '$compile', '$interval', '$timeout', '$modal', '$filter'];

    function heatMap($document, $state, mapStore, $compile, $interval, $timeout, $modal, $filter) {
        return {
            restrict: 'A',
            scope: {},
            link: function(scope, el, attrs, ctrl) {
                var body = $document[0].body;

                scope.started = false;
                scope.tabHiddenFor = 0;
                var controls = '<div ng-include="\'src/features/controls.html\'"></div>';
                angular.element(body).prepend($compile(controls)(scope));

                scope.start = function() {
                    $document.bind('click', record);
                    $document.bind('mousemove', record);
                    startRecordingIdleTime({
                        pageX: 0,
                        pageY: 0
                    });
                    scope.started = true;
                    mapStore.prev = Date.now();
                };

                scope.stop = function() {
                    $document.unbind('click', record);
                    $document.unbind('mousemove', record);
                    stopRecordingIdleTime();
                    setFlags();
                    scope.started = false;
                };

                scope.reset = function() {
                    scope.stop();
                    mapStore.clear();
                    var ol = document.getElementById('overlay');
                    if(ol) {
                        body.removeChild(ol);
                    }
                    setFlags();
                };

                scope.toggle = function(e, type, showTracking) {
                    var ol = document.getElementById('overlay');
                    var elem = e.srcElement || e.target;
                    if (ol) {
                        body.removeChild(ol);
                        if (type === 'click') {
                            elem.innerText = 'Show Click Events';
                        } else if (type === 'hover') {
                            if(showTracking) {
                                elem.innerText =  'Show Mouse Track';
                            } else {
                                elem.innerText = 'Show Hover Events';
                            }
                        } else {
                            elem.innerText = 'Show Idle Time';
                        }
                    } else {
                        var overlay = '<div id="overlay" class="overlay"></div>';
                        angular.element(body).prepend(overlay);
                        if (type === 'click') {
                            elem.innerText = 'Hide Click Events';
                        } else if (type === 'hover') {
                            if(showTracking) {
                                elem.innerText =  'Hide Mouse Track';
                            } else {
                                elem.innerText = 'Hide Hover Events';
                            }
                        } else {
                            elem.innerText = 'Hide Idle Time';
                        }
                        drawOnCanvas(type, showTracking);
                    }
                };

                scope.showFrequency = function() {
                    scope.usageArr = [];
                    var target = null;
                    _.each(mapStore.db[$state.current.name]['click'], function(evt) {
                        var obj = {};
                        target = evt.target.nodeName || evt.srcElement.nodeName;
                        var range = document.caretRangeFromPoint(evt.pageX, evt.pageY);
                        if (range) {
                            range.expand('word');
                            var word = range.startContainer.textContent.substring(range.startOffset, range.endOffset);
                            var freqWord = (target === 'BUTTON' || target === 'A') ?  evt.target.outerText : word;
                            var index = getFrequencyOf(freqWord, target);
                        }
                        obj = {
                            'state': $state.current.name,
                            'word': freqWord,
                            'frequency': 1,
                            'target': target,
                            'time': ($filter('date')(evt.timeStamp, 'medium')).toString()
                        };
                        if(index === -1){
                            scope.usageArr.push(obj);
                        } else {
                            scope.usageArr[index].frequency++;
                            scope.usageArr[index].time = scope.usageArr[index].time + ', ' + obj.time;
                        }
                    });

                    var btnStr = '<button type="button" ng-csv="usageArr" csv-header="[\'State\',\'Word\', \'Frequency\', \'Type\', \'Time\']" filename="frequency.csv" style="display: none;">Export</button>';
                    btnStr = $compile(btnStr)(scope);
                    angular.element(body).prepend(btnStr);
                    $timeout(function(){
                        btnStr.trigger('click');
                    })

                };

                scope.viewReport = function() {

                    var modalInstance = $modal.open({
                        templateUrl: 'src/features/report/chart.html',
                        size: 'md',
                        backdrop: 'static',
                        controller: 'ReportController',
                        controllerAs: 'Vm',
                        animation: true
                    });

                };

                function getFrequencyOf(word, target) {
                    var ind = -1;
                    _.each(scope.usageArr, function(sample, index) {
                        if(sample.word === word && sample.target === target) {
                            ind = index;
                            return;
                        }
                    });
                    return ind;
                }

                function startRecordingIdleTime(event) {
                    scope.intervalId = $interval(function() {
                        event.eventType = 'idle';
                        mapStore.saveEvent(event, $state.current.name);
                    }, 0500);
                }

                function stopRecordingIdleTime() {
                    $interval.cancel(scope.intervalId);
                }

                function setFlags() {
                    scope.hasClickData = mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name].click && mapStore.db[$state.current.name].click.length;
                    scope.hasHoverData = mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name].hover && mapStore.db[$state.current.name].hover.length;
                    scope.hasIdleData = mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name].idle && mapStore.db[$state.current.name].idle.length;
                }

                function drawOnCanvas(type, showTracking) {
                    var overlayEl = document.getElementById('overlay');
                    overlayEl.style.height = body.scrollHeight + 'px';
                    overlayEl.style.width = body.scrollWidth + 'px';

                    var config = {
                        container: overlayEl,
                        radius: 30,
                        maxOpacity: 0.5,
                        minOpacity: 0,
                        blur: 0.75
                    };

                    scope.map = h337.create(config);
                    if (mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name][type] && mapStore.db[$state.current.name][type].length) {
                        if(showTracking){
                            showTracker($state.current.name, type, 0);
                        } else {
                            _.each(mapStore.db[$state.current.name][type], function(evt) {
                                //draw scope.map
                                scope.map.addData({
                                    x: evt.pageX,
                                    y: evt.pageY,
                                    value: evt.detail
                                });
                            });
                        }
                    }
                }


                function showTracker(state, type, i) {
                    var evt = mapStore.db[state][type][i];
                    var trackerId = setTimeout(function() {
                        scope.map.addData({
                            x: evt.pageX,
                            y: evt.pageY,
                            value: evt.detail
                        });
                        if(i === mapStore.db[state][type].length - 1 ) {
                            clearTimeout(trackerId);
                            window.scrollTo(0, 0);
                        } else {
                            window.scrollTo(evt.pageX - window.outerWidth/2, evt.pageY - window.outerHeight/2);
                            i = i+1;
                            showTracker(state, type, i);
                        }
                    }, evt.lag);
                }

                function record(event) {
                    stopRecordingIdleTime();
                    mapStore.saveEvent(event, $state.current.name);
                    startRecordingIdleTime(event);
                }

                //visibility of page

                var hidden, visibilityChange;
                if (typeof document.hidden !== "undefined") {
                    hidden = "hidden";
                    visibilityChange = "visibilitychange";
                } else if (typeof document.mozHidden !== "undefined") {
                    hidden = "mozHidden";
                    visibilityChange = "mozvisibilitychange";
                } else if (typeof document.msHidden !== "undefined") {
                    hidden = "msHidden";
                    visibilityChange = "msvisibilitychange";
                } else if (typeof document.webkitHidden !== "undefined") {
                    hidden = "webkitHidden";
                    visibilityChange = "webkitvisibilitychange";
                }

                function handleVisibilityChange() {
                    if (document[hidden]) {
                        startRecordingHidden();
                    } else {
                        endRecordingHidden();
                    }
                }

                if (typeof document.addEventListener !== "undefined" || typeof document[hidden] !== "undefined") {
                    document.addEventListener(visibilityChange, handleVisibilityChange, false);
                }

                function startRecordingHidden() {
                    scope.startHideAt = Date.now();
                }

                function endRecordingHidden() {
                    var newTotal = Date.now() - scope.startHideAt;
                    scope.tabHiddenFor += newTotal;
                }


                //perf stuff
                setInterval(function interval(){
                    var t1 = Date.now();
                    scope.$apply();
                    scope.digestDuration = (Date.now() - t1);
                }, 0200);

            }
        }
    }
})();
(function() {
    angular
        .module('DemoApp').factory('mapStore', function() {
            var map = {};

            map.saveEvent = function(evt, state) {
                if(map.prev) {
                    evt.lag = (Date.now() - map.prev);
                }
                map.db = map.db || {};
                map.db[state] = map.db[state] || {};
                map.db[state].hover = map.db[state].hover || [];
                map.db[state].click = map.db[state].click || [];
                map.db[state].idle = map.db[state].idle || [];
                if (evt.type === 'mousemove' && angular.isUndefined(evt.eventType)) {
                    map.db[state].hover.push(evt);
                } else if (evt.type === 'click' && angular.isUndefined(evt.eventType)) {
                    map.db[state].click.push(evt);
                } else if (evt.eventType === 'idle') {
                    map.db[state].idle.push(evt);
                }
                map.prev = Date.now();
            };

            map.clear = function() {
                map.db = {};
            };

            return map;
        });
})();