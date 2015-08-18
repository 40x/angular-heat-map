(function() {
    'use strict';

    angular.module('DemoApp').controller('DemoController', DemoController );

    DemoController.$inject = ['mapStore', '$state'];

    function DemoController (mapStore, $state) {
        var demoVm = this;
    }

})();