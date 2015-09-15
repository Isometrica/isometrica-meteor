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
      var delegates = [];
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
 * Access attribute - disabled / anbled a set of fields based on whether the
 * current user has the required superpowers.
 *
 * @author Steve Fortune
 */
function isaSuperpowers() {
  return {
    restrict: 'A',
    require: 'isaAccess',
    controller: function($scope) {
      this.allowed = function() {
        return $scope.allowed();
      };
    },
    link: function(scope, elm, attrs, isaAccessCtrl) {
      var superpowerPfx = "can"
      var superpowers = _.filter(_.keys(attrs.$attr), function(key) {
        return key.indexOf(superpowerPfx) > -1;
      });
      var mem = scope.$meteorObject(Memberships, {
        userId: scope.$root.currentUser._id
      });
      scope.allowed = function() {
        return _.every(superpowers, function(superpower) {
          return !!mem[superpower];
        });
      };
      scope.$watch(function() {
        return isaAccessCtrl.allow();
      }, function(newValue) {
        var allow = scope.allowed();
        if (allow !== newValue) {
          isaAccessCtrl.setAllow(allow);
        }
      });
    }
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
    require: [ 'isaAccess', '?isaSuperpowers' ],
    controller: function() {},
    link: function(scope, elm, attrs, ctrls) {
      var isaAccessCtrl = ctrls[0];
      var isaSuperpowersCtrl = ctrls[1];
      var indicator = $compile(
        '<div class="form-group ng-hide text-center" ng-show="loading">' +
        '<i class="fa fa-spin fa-spinner"></i>' +
        '</div>'
      )(scope);
      elm.append(indicator);
      scope.$watch(function() {
        return scope.loading;
      }, function(newValue) {
        var disabled = !newValue;
        if (isaSuperpowersCtrl) {
          isaAccessCtrl.setAllow(disabled && isaSuperpowersCtrl.allowed());
        } else {
          isaAccessCtrl.setAllow(disabled);
        }
      });
    },
    scope: {
      loading: '='
    }
  };
}
