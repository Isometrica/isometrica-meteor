'use strict';

angular
  .module('isa.user')
  .directive('isaAccess', isaAccess)
  .directive('isaLoading', isaLoading)
  .directive('isaSuperpowers', isaSuperpowers);

/**
 * Wraps a fieldset. Parent of our fieldset-related attribute directives.
 *
 * @author Steve Fortune
 */
function isaAccess() {
  return {
    restrict: 'EA',
    transclude: true,
    controller: function($scope) {
      this.setAllow = function(allow) {
        $scope.allow = allow;
      };
      this.allow = function() {
        return $scope.allow;
      }
    },
    link: function(scope) {
      scope.allow = true;
    },
    template:
      '<fieldset ng-disabled="!allow" ng-transclude></fieldset>'
  };
}

/**
 * Access attribute - disabled / enable a set of fields based on whether a
 * bound property is truthy/falsey.
 *
 * @author Steve Fortune
 */
function isaLoading($compile) {
  return {
    restrict: 'A',
    require: 'isaAccess',
    link: function(scope, elm, attrs, isaAccessCtrl) {
      var indicator = $compile(
        '<div class="form-group ng-hide text-center" ng-show="loading">' +
        '<i class="fa fa-spin fa-spinner"></i>' +
        '</div>'
      )(scope);
      elm.append(indicator);
      var previousAccess;
      scope.$watch(function() {
        return scope.loading;
      }, function(loading) {
        var access = isaAccessCtrl.allow();
        if (access && loading) {
          isaAccessCtrl.setAllow(false);
          previousAccess = true;
        } else if (!loading && previousAccess) {
          isaAccessCtrl.setAllow(true);
          previousAccess = false;
        }
      });
    },
    scope: {
      loading: '='
    }
  };
}

/**
 * Access attribute - disabled / anbled a set of fields based on whether the
 * current user has the required superpowers.
 *
 * @author Steve Fortune
 */
function isaSuperpowers() {
  return {
    restrict: 'A',
    require: 'isaAccess',
    link: function(scope, elm, attrs, isaAccessCtrl) {
      var superpowerPfx = "can"
      var superpowers = _.filter(_.keys(attrs.$attr), function(key) {
        return key.indexOf(superpowerPfx) > -1;
      });
      var mem = scope.$meteorObject(Memberships, {
        userId: scope.$root.currentUser._id
      });
      var allowed = function() {
        return _.every(superpowers, function(superpower) {
          return !!mem[superpower];
        });
      };
      isaAccessCtrl.setAllow(allowed());

      scope.$watch(function() {
        return isaAccessCtrl.allow();
      }, function(newValue) {
        var allow = allowed();
        if (allow !== newValue) {
          scope.allow = allow;
        }
      });
    }
  };
}
