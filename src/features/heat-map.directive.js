(function() {
    angular
        .module('DemoApp').directive('heatmap', heatMap);

    heatMap.$inject = ['$document', '$state', 'mapStore', '$compile', '$interval'];

    function heatMap($document, $state, mapStore, $compile, $interval) {
        return {
            restrict: 'A',
            scope: {},
            link: function(scope, el, attrs, ctrl) {
                var body = $document[0].body;

                scope.started = false;
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
                    setFlags();
                };

                scope.toggle = function(e, type) {
                    var ol = document.getElementById('overlay');
                    var elem = e.srcElement || e.target;
                    if (ol) {
                        body.removeChild(ol);
                        if (type === 'click') {
                            elem.innerText = 'Show Click Events';
                        } else if (type === 'hover') {
                            elem.innerText = 'Show Hover Events';
                        } else {
                            elem.innerText = 'Show Idle Time';
                        }
                    } else {
                        var overlay = '<div id="overlay" class="overlay"></div>';
                        angular.element(body).prepend(overlay);
                        if (type === 'click') {
                            elem.innerText = 'Hide Click Events';
                        } else if (type === 'hover') {
                            elem.innerText = 'Hide Hover Events';
                        } else {
                            elem.innerText = 'Hide Idle Time';
                        }
                        drawOnCanvas(type);
                    }
                };

                scope.analyze = function() {
                    if (!scope.analyzing) {
                        $document.bind('click', analyze);
                        scope.analyzing = true;
                    } else {
                        $document.unbind('click', analyze);
                        scope.analyzing = false;
                    }
                };

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
                //

                function analyze(e) {
                    if (mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name].length) {
                        var output = net.run([e.pageX, e.pageY]);
                        if (output[0] > 0.8) {
                            console.log(output[0], 'Hot');
                        } else if (output[0] < 0.8 && output[0] > 0.5) {
                            console.log(output[0], 'Warm');
                        } else {
                            console.log(output[0], 'Cold');
                        }
                    }
                }


                function drawOnCanvas(type) {
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

                    var map = h337.create(config);
                    if (mapStore.db && mapStore.db[$state.current.name] && mapStore.db[$state.current.name][type] && mapStore.db[$state.current.name][type].length) {
                        var netArray = [];
                        var weight = null;
                        _.each(mapStore.db[$state.current.name][type], function(evt) {
                            //draw map
                            map.addData({
                                x: evt.pageX,
                                y: evt.pageY,
                                value: evt.detail
                            });

                            netArray.push({
                                input: [evt.pageX, evt.pageY],
                                output: [1]
                            });
                        });
                    }
                }

                function record(event) {
                    stopRecordingIdleTime();
                    mapStore.saveEvent(event, $state.current.name);
                    startRecordingIdleTime(event);
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