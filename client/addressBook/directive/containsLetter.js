'use strict';

var app = angular.module('isa.addressbook');

/**
 * Validates that password contains at least 1 character
 *
 * @author Steve Fortune
 */
app.directive('containsLetter', function() {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.containsLetter = function(modelValue, viewValue) {
				return ctrl.$isEmpty(modelValue) || /[a-zA-Z]/.test(viewValue);
			};
		}
	};
});
