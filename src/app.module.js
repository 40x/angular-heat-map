(function() {
    angular
        .module('DemoApp', ['ui.router', 'ngCsv'])

        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
                name: 'home',
                url: '/home',
                template: '<div class="tab tab1"><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p> <br><br><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p><br><br> <p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p> <br><br> <p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p> <br><br><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p> <br><br><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p><br><br><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p><br><br><p>The purpose of this application is to be able to track the interaction of the users with the application on a given device. This gives the development team a better insight into what the end user actually uses and to what extent, this leads to better design and functionality. In the first pass we have decided to implement the functionality for desktops which record the interactions at the state level for better analysis of the data.</p></div>'
            })

            .state('future', {
                name: 'future',
                url: '/future',
                template: '<div class="tab tab2"><p>The future scope of this application can be extended to provide predictive analysis on what parts of the application are being used to their highest extent and which ones could be modified for a better user experience. We plan on using javascript based neural network for analyzing the user interaction, but because of the nature of the data set being used (mostly because it is small) the training system is erroneous, we plan on overcoming it by collecting a larger set of data.</p><br><br> <p>Another challenge that we have identified is to show the activity pertaining to hover events like dropdowns, modal and any other dom element that does not persist on the screen. We plan on recording the user activity end to end and replay the whole activity to avoid any gap in data. The biggest challenge here would be to overcome the involuntary XSS feature implemented by the browsers.</p></div>'
            })

            .state('performance', {
                name: 'performance',
                url: '/performance',
                template: '<div class="tab tab3"><p>One of the primary risks that we expected to come accross while building this app was the performance. Primarily because of the nature of the tasks being performed by the tool which are considered to be DOM heavy, however we have employed some HPC javascript libraries to help us overcome this problem. Apart from the sluggy DOM, another major concern is the digest cycle and watchers, the tool is built in such a way that the digest cycle is relatively inexpensive. The only watchers that are being set right now are demo specific. </p></div>'
            })

    }
})();