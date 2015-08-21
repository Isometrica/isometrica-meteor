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
    link: function(scope, elm, attrs, formCtrl){
      elm.submit(function() {
        console.log('Event boradcasting: ' + formCtrl.$name);
        $rootScope.$broadcast(formCtrl.$name + '.submit');
      });
    }
	};
}
