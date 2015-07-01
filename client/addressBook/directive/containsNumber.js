'use strict';

var app = angular.module('isa.addressbook');

/**
 * Validates that password contains at least 1 number
 *
 * @author Steve Fortune
 */
app.directive('containsNumber', function() {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.containsNumber = function(modelValue, viewValue) {
				return ctrl.$isEmpty(modelValue) || /\d/.test(viewValue);
			};
		}
	};
});
