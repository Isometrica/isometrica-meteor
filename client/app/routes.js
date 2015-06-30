
var app = angular.module('isa');

app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider

            .state('welcome', {
                url: '/welcome',
                templateUrl: 'client/home/home.ng.html',
                controller: 'HomeController'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'client/login/login.ng.html',
                controller : 'LoginController'
            })
            .state('overview', {
                url: '/overview',
                templateUrl: 'client/overview/overview.ng.html',
                controller: 'OverviewController',
            })

        $urlRouterProvider.otherwise('/welcome');

    }]);
