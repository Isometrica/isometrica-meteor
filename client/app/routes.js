
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
            .state('organisation', {
              url: '/organisation/:orgId',
              parent: 'base',
              abstract: true,
              template: '<ui-view/>',
              resolve: {
                organisation: ['$stateParams', '$meteor', '$q', function($stateParams, $meteor, $q) {
                  return $meteor.subscribe('organisations').then(function() {
                    return $meteor.object(Organisations, $stateParams.orgId);
                  });
                }]
              }
            })

            /**
             * This is the parent route for all modules. It defines a url with the required
             * module identifier.
             */
            .state('module', {
                url : '/module/:moduleId',
                parent: 'organisation',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    module: [
                        '$stateParams', '$meteor', function($stateParams, $meteor) {
                            return $meteor.subscribe('modules').then( function(subHandle) {
                                return $meteor.object(Modules, $stateParams.moduleId);
                            })
                        }
                    ]
                }
            })

        $urlRouterProvider.otherwise('/welcome');

    }]);
