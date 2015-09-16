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

      if (_.has(attrs.$attr, 'isaSuperpowers')) {

        var user = scope.$root.currentUser;
        if (!user) {
          scope.denied = false;
          return;
        }

        var mem = scope.$meteorObject(Memberships, {
          userId: scope.$root.currentUser._id
        });
        var hasPower = function(power) {
          return !!mem[power];
        };
        var invalidateDeny = function(powers) {
          var predicate = _.isArray(powers)
            ? hasPower : function(condition, power) {
              return condition ? hasPower(power) : true;
            };
          scope.denied = !_.every(powers, predicate);
        };

        scope.$watchCollection(function() {
          return mem;
        }, function(newMem) {
          invalidateDeny(scope.isaSuperpowers);
        });
        scope.$watchCollection('isaSuperpowers', invalidateDeny);

      }

      if (_.has(attrs.$attr, 'isaLoading')) {
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
