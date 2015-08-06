'use strict';

var app = angular.module('isa.addressbook');

/**
 * Renders a list of phone numbers for the user.
 *
 * @author Steve Fortune
app.directive('isaPhoneNumbers', function() {
	return {
		restrict: 'E',
        templateUrl: 'client/addressBook/view/phoneNumbers.ng.html',
        controller: ['PhoneNumberService', '$scope', function(PhoneNumberService, $scope) {

            $scope.newPhoneNumber = {};

            $scope.phoneNumbers = new Collection(function() {
                return PhoneNumberService.all($scope.contactable);
            }, false);

            $scope.$watch('contactable', function(newContactable, oldContactable) {
                if (newContactable) {
					newContactable.type = $scope.type; // @note Temporary workaround
                    $scope.phoneNumbers.refresh();
                }
            });

            $scope.addPhoneNumber = function() {
                PhoneNumberService.add($scope.contactable, $scope.newPhoneNumber).then(function() {
                    $scope.phoneNumbers.refresh();
                });
                $scope.newPhoneNumber = {};
            }

            $scope.removePhoneNumber = function(number) {
                PhoneNumberService.delete($scope.contactable, number).then(function() {
                    $scope.phoneNumbers.refresh();
                });
            }

        }],
        scope: {
            contactable: '=',
            type: '@',
            readonly: '@'
        }
	};
});
*/
