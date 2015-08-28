'use strict';

angular
	.module('isa.overview')
	.directive('isaAddressBookPanel', isaAddressBookPanelDirective);

function isaAddressBookPanelDirective($modal) {
	return {
    templateUrl: 'client/overview/addressBookPanel.ng.html',
		restrict: 'E',
		link: function(scope) {
			scope.pushInvitationModal = function() {
				$modal.open({
					templateUrl: 'client/addressBook/view/inviteUsers.ng.html',
					controller: 'AddressBookInviteUsersController'
				});
			};
		}
	};
};
