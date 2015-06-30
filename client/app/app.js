
var app = angular.module('isa', [
    'angular-meteor',
    'ui.bootstrap',
    'ui.router'
]);

app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $stateProvider

            .state('welcome', {
            url: '/welcome',
            templateUrl: 'client/home/home.ng.html',
            controller: 'HomeController'
        })

        $urlRouterProvider.otherwise('/welcome');

    }]);

var boot = function() {
    angular.bootstrap(document, [ 'isa' ]);
};

if (Meteor.isCordova) {
    angular.element(document).on("deviceready", boot);
} else {
    angular.element(document).ready(boot);
}
