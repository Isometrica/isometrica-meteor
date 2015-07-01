'use strict';

var app = angular.module('isa.addressbook');

/**
 * Async form validation directive that checks whether a user exists
 * for the given email address
 *
 * @author Steve Fortune
 */
app.directive('existsEmail', ['$q', 'UserService', function($q, UserService) {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, elm, attrs, ctrl) {

			/**
			 * Has the original mobel value been set?
			 *
			 * @private
			 */
			ctrl.isOriginalValueSet = false;

			/**
			 * Makes sure that the original value is set.
			 *
			 * @private
			 */
			var setOriginalValue = function() {
				if (!ctrl.isOriginalValueSet) {
					ctrl.originalValue = ctrl.$modelValue;
					ctrl.isOriginalValueSet = true;
				}
			};

			scope.$watch(setOriginalValue);

			ctrl.$asyncValidators.existsEmail = function(modelValue, viewValue) {
				if (
					ctrl.$isEmpty(modelValue) ||
					!ctrl.isOriginalValueSet ||
					modelValue === ctrl.originalValue
				) {
					return $q.when();
				}
				return UserService.emailExists(modelValue).then(function(exists) {
					if (exists) {
						return $q.reject();
					}
				});
			};
		}
	};
}]);
