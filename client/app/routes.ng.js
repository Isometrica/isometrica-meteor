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
        resolve : {
          settingsSub: function($meteor) {
            return $meteor.subscribe('settings');
          },
          systemTextsSub: function($meteor) {
            return $meteor.subscribe('systemTexts');
          },
        },
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
      .state('404', {
        url: '/errors/page-not-exist',
        parent: 'base',
        templateUrl: 'client/errs/404.ng.html',
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
       * @todo If we reject, goNext, go('dormant'), then the membership subscription
       * is never stopped.
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
          subs: function($meteor) {
            return $meteor.subscribe('memberships');
            // @note So it turns out that onExit may fire _after_ the next route
            // dependencies start resolving. Using our isaSubs service here results
            // in the subs being closed after they are resolved if we navigate
            // between organisations.
            //
            // As a temporary workaround, I've just reverted to $meteor.subscribe
            // and assumed that no one will try to delete themselves for the demo.
            //
            //return isaSubs.require('memberships');
          },
          currentUser: function($meteor) {
            return $meteor.requireUser();
          },
          organisation: function($stateParams, $state, $rootScope, $q, subs, currentUser, ERRS) {
            var orgId = $stateParams.orgId;
            var org = Organisations.findOne(orgId || {});
            if (orgId && !org) {
              return $q.reject(ERRS.unauthorized);
            } else if (!orgId && org) {
              $state.goNext({ orgId: org._id }, { reload: false });
            } else if(!org) {
              $state.go('dormant')
              return $q.reject();
            }
            $rootScope.currentOrg = org;
            return org;
          }
        },
        onExit: function(subs) {
          subs.stop();
        }
      })
      .state('overview', {
        url: '/overview?:view',
        parent: 'organisation',
        templateUrl: 'client/overview/overview.ng.html',
        controller: 'OverviewController',
        reloadOnSearch: false,
        resolve : {
          modulesSub: function($meteor) {
            return $meteor.subscribe('modules');
          }
        },
        onExit: function(modulesSub) {
          modulesSub.stop();
        }
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
