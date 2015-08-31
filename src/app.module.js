(function() {
    angular
        .module('DemoApp', ['ui.router', 'ui.bootstrap', 'uiTrack'])
        .factory('myInterceptor', function($q) {
            var numberOfHttpCalls = {
              'GET' : 0,
               'PUT' : 0
            };
            return {
                request: function (config) {
                    if(config.method === 'GET') {
                        numberOfHttpCalls['GET']++;
                    } else if(config.method === 'PUT') {
                        numberOfHttpCalls['PUT']++;
                    }
                    return config || $q.when(config);
                },
                numberOfHttpCalls: numberOfHttpCalls
            };
        })
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider','$httpProvider'];

    function config($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('myInterceptor');
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