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

      $scope.addPhoneNumber = function() {
        if (!$scope.contactable.phoneNumbers) {
          $scope.contactable.phoneNumbers = [];
        }
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
