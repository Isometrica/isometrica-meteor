'use strict';

var app = angular.module('isa');

app
  /**
   * Decorates $state to cache the next and previous states. It listens
   * to `$stateChangeStart` to grab them.
   *
   * @see http://stackoverflow.com/a/27255909/1454517
   */
  .config(function($provide) {
    $provide.decorator('$state', function($delegate, $rootScope) {

      /**
       * Go do the `next` state; merges the given params with the
       * existing `next` params.
       *
       * @param params  Object
       * @param opts    Object
       */
      $delegate.goNext = function(params, opts) {
        var params = angular.extend({}, this.next.params, params);
        $delegate.go($delegate.next.state, params, opts);
      };

      /**
       * Goes the state that user was trying to access before they
       * were redirected to a login page; or the specified route if
       * one is not cached.
       *
       * The `beforeLogin` state is cached and the user is redirected
       * to login iff they try to access a guarded state and they are
       * not authenticated. The cache is cleared after `goFromLogin`
       * is called.
       *
       * @param params  Object
       * @param opts    Object
       */
      $delegate.goFromLogin = function(or, params, opts) {
        if ($delegate.beforeLogin) {
          var params = angular.extend({}, this.beforeLogin.params, params);
          $delegate.go($delegate.beforeLogin.state, params, opts);
          $delegate.beforeLogin = null;
        } else {
          $delegate.go(or, params, opts);
        }
      };

      /**
       * Caches the state and params that the user should ideally be
       * taken to on `goFromLogin`.
       *
       * @param state   Object 
       * @param params  Object
       */
      $delegate.setBeforeLogin = function(state, params) {
        $delegate.beforeLogin = {
          state: state,
          params: params
        };
      };

      return $delegate;
    });
  })
  .run(function($rootScope, $state, $stateParams, $templateCache) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      //check if the state is guarded by a role
      if (toState.data && toState.data.roles) {

        var hasOneRole = false;

        _.each(toState.data.roles, function(role) {
          if ( Roles.userIsInRole($rootScope.currentUser._id, role, Roles.GLOBAL_GROUP ) ) {
            hasOneRole = true;
          }
        });

        //if user doesn't have one of the required roles: redirect to login form
        if (!hasOneRole) {
          $state.go('login');
        }
      }

      $state.next = {
        state: toState,
        params: toParams
      };

    });

    // @todo: do we still need this ?
    $rootScope.$state = $state;

    //check user's roles
    if ($rootScope.currentUser) {
      $rootScope.isSysAdmin = Roles.userIsInRole($rootScope.currentUser._id, "sysAdmin", Roles.GLOBAL_GROUP );
    }

    //override bootstrap accordion templates
    $templateCache.put('template/accordion/accordion.html', '<div ng-transclude></div>');
    $templateCache.put('template/accordion/accordion-group.html',
      ['<div class="panel panel-default bootcards-panel-collapsing">',
      '<div class="panel-heading clearfix" ng-click="$event.preventDefault(); toggleOpen()">',
        '<i class="fa bootcards-panel-collapsing-indicator" ng-class="{',
        '\'fa-chevron-circle-right\': !isOpen,',
        '\'fa-chevron-circle-down\': isOpen',
        '}"></i>',
      '<div accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></div>',
      '</div>',
      '<div class="panel-collapse collapse" collapse="!isOpen">',
        '<div class="panel-body" ng-transclude></div>',
      '</div>',
      '</div>'].join('\n'));
  });
