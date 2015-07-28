var app = angular.module('isa');

app.service('isaOrgService', function($meteor, $rootScope, $stateParams) {
  var subscr;
  var subscrQ;
  $meteor.autorun($rootScope, function() {
    subscrQ = $meteor.subscribe('memberships').then(function(sub) {
      subscr = sub;
      return Organisations.findOne($stateParams.orgId);
    });
  });
  this.require = function() {
    return subscrQ;
  };
});

app
  .run(MultiTenancy.bindNgState({
    stateConfig: {'overview': ['modules']}
  }))
  .config(MultiTenancy.ngDecorate())
  .config(function($urlRouterProvider, $stateProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $stateProvider

      .state('base', {
        abstract: true,
        controller: 'BaseController',
        template: '<ui-view/>',
        data: {
          anonymous: false
        }
      })

      .state('welcome', {
        url: '/welcome',
        parent: 'base',
        templateUrl: 'client/home/home.ng.html',
        controller: 'HomeController',
        data: {
          anonymous: true
        }
      })
      .state('login', {
        url: '/login',
        parent: 'base',
        templateUrl: 'client/login/login.ng.html',
        controller: 'LoginController',
        data: {
          anonymous: true
        }
      })
      .state('organisation', {
        url: '/organisation/:orgId',
        parent: 'base',
        abstract: true,
        template: '<ui-view/>',
        resolve: {
          organisation: function(isaOrgService) {
            return isaOrgService.require();
          }
        }
      })
      .state('overview', {
        url: '/overview',
        parent: 'organisation',
        templateUrl: 'client/overview/overview.ng.html',
        controller: 'OverviewController'
      })
      .state('module', {
        url: '/module/:moduleId',
        parent: 'organisation',
        abstract: true,
        template: '<ui-view/>',
        resolve: {
          moduleSub: function($meteor) {
            return $meteor.subscribe('modules');
          },
          module: function($meteor, $stateParams, moduleSub) {
            return Modules.findOne($stateParams.moduleId);
          }
        },
        onExit: function(moduleSub) {
          moduleSub.stop();
        }
      });

    $urlRouterProvider.otherwise('/welcome');

  });
