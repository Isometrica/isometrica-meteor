'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.directive('isaAddressBookHeader', function() {
	return {
		templateUrl: '/components/addressBook/view/header.html',
		restrict: 'AE',
		scope: {
			selectState: '=',
			organisation: '='
		}
	};
});
