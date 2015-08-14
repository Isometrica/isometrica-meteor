'use strict';

angular
  .module('isa.addressbook')
  .directive('isaEmptyAttr', isaEmptyAttrDirective);

/**
 * Helpful directive to avoid `{{ someVar || 'Null str' }}` boilerplate.
 *
 * @author Steve Fortune
 */
function isaEmptyAttrDirective() {
  return {
    restrict: 'A',
    compile: function() {
      return function(scope, elm, attrs) {
        var noneStr = 'Unknown'
        scope.$watch('value', function() {
          if (!scope.value || (scope.value.trim && !scope.value.trim())) {
            elm.html(noneStr);
          } else {
            elm.html(scope.value);
          }
        });
      };
    },
    scope: {
      value: '='
    }
  };
};
