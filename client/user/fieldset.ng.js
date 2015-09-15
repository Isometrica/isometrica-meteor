'use strict';

angular
  .module('isa.user')
  .directive('isaFieldset', isaFieldset)
  .directive('isaLoading', isaLoading)
  .directive('isaSuperpowers', isaSuperpowers);

/**
 * Wraps a fieldset. Parent of our fieldset-related attribute directives.
 *
 * @author Steve Fortune
 */
function isaFieldset() {
  return {
    restrict: 'E',
    transclude: true,
    controller: function($scope) {
      $scope.allow = true;
      this.setAllow = function(allow) {
        $scope.allow = allow;
      };
      this.allow = function() {
        return $scope.allow;
      }
    },
    template:
      '<fieldset ng-disabled="!allow" ng-transclude></fieldset>'
  };
}

/**
 * @author Steve Fortune
 */
function isaLoading($compile) {
  return {
    restrict: 'A',
    require: 'isaFieldset',
    link: function(scope, elm, attrs, isaFieldsetCtrl) {
      var indicator = $compile(
        '<div class="form-group ng-hide text-center" ng-show="loading">' +
        '<i class="fa fa-spin fa-spinner"></i>' +
        '</div>'
      )(scope);
      elm.append(indicator);
      scope.$watch(function() {
        return scope.loading;
      }, function(loading) {
        isaFieldsetCtrl.setAllow(!loading);
      });
    },
    scope: {
      loading: '='
    }
  };
}

/**
 * @author Steve Fortune
 */
function isaSuperpowers() {
  return {
    restrict: 'A',
    require: 'isaFieldset',
    link: function(scope, elm, attrs, isaFieldsetCtrl) {
      var superpowers = _.filter(attrs, function(attr) {
        return attr.indexOf("can");
      });
      var mem = scope.$meteorObject(Memberships, {
        userId: scope.$root.currentUser._id
      });
      scope.$watch(function() {
        return mem;
      }, function() {
        isaFieldsetCtrl.setAllow(_.every(superpowers, function(superpower) {
          return _.has(mem, superpower);
        }));
      });
    }
  };
}
