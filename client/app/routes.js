
var app = angular.module('isa');

/**
 * Multi-tenancy setup.
 */
app
  .run(MultiTenancy.bindNgState({
    stateConfig: { 'overview': ['modules'] }
  }))
  .config(MultiTenancy.ngDecorate());

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
            .state('organisation', {
              url: '/organisation/:orgId',
              parent: 'base',
              abstract: true,
              template: '<ui-view/>'
            })
            .state('overview', {
                url: '/overview',
                parent: 'organisation',
                templateUrl: 'client/overview/overview.ng.html',
                controller: 'OverviewController'
            })
            .state('module', {
                url : '/module/:moduleId',
                parent: 'organisation',
                abstract: true,
                template: '<ui-view/>'
            })

        $urlRouterProvider.otherwise('/welcome');

    }]);
