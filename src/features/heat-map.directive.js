(function() {
    angular
        .module('DemoApp').directive('uiTrack', heatMap);

    heatMap.$inject = ['$document', '$state', 'mapStore', '$compile', '$interval', '$timeout'];

    function heatMap($document, $state, mapStore, $compile, $interval, $timeout) {
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
                            'target': target
                        };
                        if(index === -1){
                            scope.usageArr.push(obj);
                        } else {
                            scope.usageArr[index].frequency++;
                        }
                    });

                    var btnStr = '<button type="button" ng-csv="usageArr" csv-header="[\'State\',\'Word\', \'Frequency\', \'Type\']" filename="frequency.csv" style="display: none;">Export</button>';
                    btnStr = $compile(btnStr)(scope);
                    angular.element(body).prepend(btnStr);
                    $timeout(function(){
                        btnStr.trigger('click');
                    })

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