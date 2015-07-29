'use strict';

angular
  .module('isa.user')
  .directive('isaLoadingFieldset', isaLoadingFieldset);

/**
 * Disables / enables a form based on the state of a $loading property.
 * Also adds cute loading indicator.
 *
 * @author Steve Fortune
 */
function isaLoadingFieldset() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    template:
      '<fieldset ng-disabled="loading">' +
      '<ng-transclude></ng-transclude>' +
      '<div class="form-group ng-hide text-center" ng-show="loading">' +
      '<i class="fa fa-spin fa-spinner"></i>' +
      '</div>' +
      '</fieldset>',
    scope: {
      loading: '='
    }
  };
}
