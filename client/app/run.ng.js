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

      return $delegate;
    });
  })
  .run(function($rootScope, $state, $stateParams) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      $state.next = {
        state: toState,
        params: toParams
      };

      var isStateGuarded = toState.data && toState.data.anonymous === false;
      var isAuthenticated = !!$rootScope.currentUser;
      if (isStateGuarded && !isAuthenticated) {
        event.preventDefault();
        $state.beforeLogin = {
          state: toState,
          params: toParams
        };
        $state.go("login");
      }

    });

    // @todo: do we still need this ?
    $rootScope.$state = $state;

  })
  .run(function($templateCache) {
    //override bootstrap accordion templates
    $templateCache.put('template/accordion/accordion.html', '<div ng-transclude></div>');
    $templateCache.put('template/accordion/accordion-group.html',
      ['<div class="panel panel-default bootcards-panel-collapsing">',
      '<div class="panel-heading" ng-click="$event.preventDefault(); toggleOpen()" accordion-transclude="heading">',
      '><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span>',
      '</div>',
      '<div class="panel-collapse collapse" collapse="!isOpen">',
        '<div class="panel-body" ng-transclude></div>',
      '</div>',
      '</div>'].join('\n'));
  });
