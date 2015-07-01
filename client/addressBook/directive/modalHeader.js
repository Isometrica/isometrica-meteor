'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.directive('isaAddressBookModalHeader', function() {
	return {
		templateUrl: '/components/addressBook/view/modalHeader.html',
		restrict: 'AE',
		scope: {
			onSave: '&',
			onCancel: '&',
			canSave: '=',
			title: '@'
		}
	};
});
