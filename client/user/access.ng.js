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
    template: '<fieldset ng-disabled="denied || isaLoading" ng-transclude></fieldset>',
    link: function(scope, elm, attrs, isaAccessCtrl) {
      if (scope.isaSuperpowers) {
        var mem = scope.$meteorObject(Memberships, {
          userId: scope.$root.currentUser._id
        });
        var hasPower = function(power) {
          return !!mem[power];
        };
        scope.$watchCollection('isaSuperpowers', function(newSuperpowers) {
          var predicate = _.isArray(newSuperpowers)
            ? hasPower : function(condition, power) {
              return condition ? hasPower(power) : true;
            };
          scope.denied = !_.every(newSuperpowers, predicate);
        });
      }
      if (_.has(scope, 'isaLoading')) {
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
