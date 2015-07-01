
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

            /**
             * This is the parent route for all modules. It defines a url with the required
             * organisation and module identifiers.
             */
            .state('module', {
                url : '/organisation/:orgId/module/:moduleId',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    module: ['$stateParams', function($stateParams) {
                        return Modules.find({ _id: $stateParams.moduleId });
                    }]
                }
            })

        $urlRouterProvider.otherwise('/welcome');

    }]);
