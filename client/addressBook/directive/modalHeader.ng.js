'use strict';

angular
  .module('isa.addressbook')
  .directive('isaAddressBookModalHeader', isaAddressBookModalHeaderDirective);

/**
 * @author Steve Fortune
 */
function isaAddressBookModalHeaderDirective() {
	return {
		templateUrl: 'client/addressBook/view/modalHeader.ng.html',
		restrict: 'AE',
		scope: {
			onSave: '&',
			onCancel: '&',
			canSave: '=',
			title: '@'
		}
	};
};
