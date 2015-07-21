'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.directive('isaAddressBookModalHeader', function() {
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
});
