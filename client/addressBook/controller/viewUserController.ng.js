'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookViewUserController', AddressBookViewUserController);

/**
 * @extends AddressBookViewController
 * @author   Steve Fortune
 */
function AddressBookViewUserController($stateParams, $scope, $modal, $controller) {

  $controller('AddressBookViewController', {
    $scope: $scope,
    $modal: $modal,
    $stateParams: $stateParams,
    collection: Meteor.users,
    editControllerConf: {
      templateUrl: 'client/addressBook/view/editUser.ng.html',
      controller: 'AddressBookEditUserController'
    }
  });

}
