'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookAcceptInviteController', AddressBookAcceptInviteController);

/**
 * This view model can be in 2 states:
 *
 * - Accepting an existing system user's invitation
 * - Accepting an invitation for a new system user
 *
 */
function AddressBookAcceptInviteController($scope, $modalInstance, $meteor, growl) {

}
