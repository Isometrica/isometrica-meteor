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
      var delegates = [
        function() {
          return true;
        }
      ];
      this.registerDelegate = function(delegateFn) {
        var indx = delegates.length;
        delegates.push(delegateFn);
        return function() {
          delegates.splice(indx, 1);
        };
      };
      $scope.allow = function() {
        console.log('Is allowed?', delegates);
        var quantified = _.every(delegates, function(delegate, index) {
          console.log('- Delegate at ', index, delegate());
          return delegate();
        });
        console.log('So, are we?', quantified);
        return quantified;
      };
    },
    template:
      '<fieldset ng-disabled="!allow()" ng-transclude></fieldset>'
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
    require: '^isaAccess',
    controller: function() {},
    link: function(scope, elm, attrs, isaAccessCtrl) {
      var superpowerPfx = "can"
      var superpowers = _.filter(_.keys(attrs.$attr), function(key) {
        return key.indexOf(superpowerPfx) > -1;
      });
      var mem = scope.$meteorObject(Memberships, {
        userId: scope.$root.currentUser._id
      });
      var destroy = isaAccessCtrl.registerDelegate(function isaSuperpowersDelegate() {
        console.log('--- Superpower delegate');
        return _.every(superpowers, function(superpower) {
          return !!mem[superpower];
        });
      });
      scope.$on('$destroy', destroy);
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
    require: '^isaAccess',
    controller: function() {},
    link: function(scope, elm, attrs, isaAccessCtrl) {
      var indicator = $compile(
        '<div class="form-group ng-hide text-center" ng-show="loading">' +
        '<i class="fa fa-spin fa-spinner"></i>' +
        '</div>'
      )(scope);
      elm.append(indicator);
      var destroy = isaAccessCtrl.registerDelegate(function isaLoadingDelegate() {
        console.log('--- Loading delegate');
        return !scope.loading;
      });
      scope.$on('$destroy', destroy);
    },
    scope: {
      loading: '='
    }
  };
}
