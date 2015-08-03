var app = angular.module('isa');

app
  /**
   * MultiTenancy configuration and angular configurations
   *
   * @see MultiTenancy
   */
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
        },
        resolve: {
          accountSub: function($meteor) {
            return $meteor.subscribe("accounts");
          }
        },
        onExit: function(accountSub) {
          accountSub.stop();
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
      /**
       * Base state for everything that requires an organisation. This finds
       * an organisation either by the `orgId` specified in the route, or if none,
       * the first organisation available in the collection. It also sets up a
       * subscription to "memberships", that it closes `onExit`.
       *
       * If it can't find an organisation at all, it will reject the route
       * transition.
       *
       * If no `orgId` is available in the route it will find the first available
       * organisation object in the collection and update the route params without
       * triggering an explicit state reload.
       *
       * It also caches the `currentOrg` in the `$rootScope` for easy access
       * in views. Note that it does not clean this up `onExit`.
       *
       * @author Steve Fortune
       */
      .state('organisation', {
        url: '/organisation/:orgId',
        parent: 'base',
        abstract: true,
        template: '<ui-view/>',
        params:  {
          orgId: {
            value: null,
            squash: true
          }
        },
        resolve: {
          memSub: function($meteor) {
            return $meteor.subscribe('memberships');
          },
          organisation: function($stateParams, $state, $rootScope, $q, memSub, ERRS) {
            var orgId = $stateParams.orgId;
            var org = Organisations.findOne(orgId || {});
            if (!org) {
              return $q.reject(ERRS.unauthorized);
            } else if (!orgId) {
              $state.goNext({ orgId: org._id }, { reload: false });
            }
            $rootScope.currentOrg = org;
            return org;
          }
        },
        onExit: function($rootScope, memSub) {
          memSub.stop();
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
