
'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookEditContactController', AddressBookEditContactController);

/**
 * @extends AddressBookEditController
 * @author   Steve Fortune
 */
function AddressBookEditContactController($scope, $modalInstance, $modal, $controller, object) {

  $controller('AddressBookEditController', {
    $scope: $scope,
    $modalInstance: $modalInstance,
    collection: $scope.$meteorCollection(isa.utils.findAll(Contacts)),
    object: object
  });

}
