
var app = angular.module('isa');

app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider

            .state('welcome', {
                url: '/welcome',
                templateUrl: 'client/home/home.ng.html',
                controller: 'HomeController',
                data : {
                    anonymous : true
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'client/login/login.ng.html',
                controller : 'LoginController',
                data : {
                    anonymous : true
                }
            })
            .state('overview', {
                url: '/overview',
                templateUrl: 'client/overview/overview.ng.html',
                controller: 'OverviewController',
                data : {
                    anonymous : false
                }

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
                        return Modules.findOne($stateParams.moduleId);
                    }]
                },
                data : {
                    anonymous : false
                }
            })

        $urlRouterProvider.otherwise('/welcome');



    }]);
