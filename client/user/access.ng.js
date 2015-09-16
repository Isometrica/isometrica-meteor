'use strict';

angular
  .module('isa.user')
  .directive('isaAccess', isaAccess);

/**
 * Wraps a set of fields and applies access constraints to them.
 *
 * @author Steve Fortune
 */
function isaAccess($compile) {
  return {
    restrict: 'EA',
    transclude: true,
    template: '<fieldset ng-disabled="denied() || isaLoading" ng-transclude></fieldset>',
    link: function(scope, elm, attrs, isaAccessCtrl) {
      if (scope.isaSuperpowers && scope.isaSuperpowers.length) {
        var mem = scope.$meteorObject(Memberships, {
          userId: scope.$root.currentUser._id
        });
        scope.denied = function() {
          return !_.every(scope.isaSuperpowers, function(power) {
            return !!mem[power];
          });
        };
      }
      if (_.has(attrs, 'isaLoading')) {
        var indicator = $compile(
          '<div class="form-group ng-hide text-center" ng-show="isaLoading">' +
          '<i class="fa fa-spin fa-spinner"></i>' +
          '</div>'
        )(scope);
        elm.append(indicator);
      }
    },
    scope: {
      isaLoading: '=',
      isaSuperpowers: '='
    }
  };
}
