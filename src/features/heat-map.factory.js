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
                map.db = [];
            };

            return map;
        });
})();