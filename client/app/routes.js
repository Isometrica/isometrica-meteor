
var app = angular.module('isa');

app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider

            .state('base', {
                abstract : true,
                controller : 'BaseController',
                template: '<ui-view/>',
                data : {
                    anonymous : false
                }
            })

            .state('welcome', {
                url: '/welcome',
                parent: 'base',
                templateUrl: 'client/home/home.ng.html',
                controller: 'HomeController',
                data : {
                    anonymous : true
                }
            })
            .state('login', {
                url: '/login',
                parent: 'base',
                templateUrl: 'client/login/login.ng.html',
                controller : 'LoginController',
                data : {
                    anonymous : true
                }
            })
            .state('overview', {
                url: '/overview',
                parent: 'base',
                templateUrl: 'client/overview/overview.ng.html',
                controller: 'OverviewController'
            })

            /**
             * This is the parent route for all modules. It defines a url with the required
             * module identifier.
             */
            .state('module', {
                url : '/module/:moduleId',
                parent: 'base',
                abstract: true,
                template: '<ui-view/>'
            })

        $urlRouterProvider.otherwise('/welcome');

    }]);
