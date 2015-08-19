'use strict';

angular
  .module('isa.addressbook')
  .directive('isaSubmitBroadcaster', isaSubmitBroadcasterDirective);

/**
 * Emits a 'form:submit' event on the $rootScope when the
 * form is submitted.
 *
 * @author Steve Fortune
 */
function isaSubmitBroadcasterDirective($rootScope) {
  return {
		restrict: 'A',
    require: 'form',
    compile: function() {
      return function(scope, elm, attrs) {
        elm.submit(function() {
          $rootScope.$emit(attrs.name + '.submit');
        });
      };
    }
	};
}
