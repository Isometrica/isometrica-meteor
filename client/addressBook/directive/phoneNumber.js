'use strict';

var app = angular.module('isa.addressbook');

/**
 * Validates that the value is a phone number. At present this verfifies that
 * the input consists of only numbers and '+'s.
 *
 * @author Steve Fortune
 */
app.directive('phoneNumber', function() {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.phoneNumber = function(modelValue, viewValue) {
				return ctrl.$isEmpty(modelValue) ||  /^\+?\d+$/.test(viewValue);
			};
		}
	};
});
