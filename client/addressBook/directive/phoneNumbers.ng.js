'use strict';

angular
  .module('isa.addressbook')
  .directive('isaPhoneNumbers', isaPhoneNumbersDirective);

function isaPhoneNumbersDirective() {
  return {
    restrict: 'E',
    templateUrl: function(elm, attrs) {
      var tmpPrefix = (attrs.readonly ? 'view' : 'edit');
      return 'client/addressBook/view/' + tmpPrefix + 'PhoneNumbers.ng.html';
    },
    controller: function($scope) {

      if (!$scope.contactable.phoneNumbers) {
        $scope.contactable.phoneNumbers = [];
      } else if (!angular.isArray($scope.contactable.phoneNumbers)) {
        throw new Error("Phone numbers must be array.");
      }
      $scope.addPhoneNumber = function() {
        $scope.contactable.phoneNumbers.push({});
      };
      $scope.removePhoneNumber = function(index) {
        $scope.contactable.phoneNumbers.splice(index, 1);
      };

    },
    scope: {
      contactable: '=',
      readonly: '@'
    }
	};
}
