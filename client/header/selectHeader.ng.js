'use strict';

angular
  .module('isa')
  .directive('isaSelectHeader', isaSelectHeaderDirective);

/**
 * Generic header that provides a central dropdown used the filter
 * a list in the body of the page.
 *
 * @author Steve Fortune
 */
function isaSelectHeaderDirective() {
  return {
    replace : true,
    restrict : 'E',
    templateUrl : 'client/header/selectHeader.ng.html',
    transclude : true,
    scope: {
      onSelectOpt : '&',
      selectedOpt: '=',
      headerTitle : '=',
      filterOpts : '='
    },
    link: function(scope) {
      scope.select = function(opt) {
        scope.selectedOpt = opt;
        scope.onSelectOpt(opt);
      };
    }
  };
}
