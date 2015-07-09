'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.config(['$stateProvider', function($stateProvider) {
	$stateProvider
		.state('addressbook', {
			parent: 'organisation',
			url: '/addressbook',
			templateUrl: '/components/addressBook/view/addressBook.ng.html',
			controller: 'AddressBookController'
		})
	$stateProvider
		.state('addressbook.user', {
			url: '/user/:id',
			templateUrl: '/components/addressBook/view/viewUser.ng.html',
			controller: 'AddressBookReadUserController'
		});
	$stateProvider
		.state('addressbook.contact', {
			url: '/contact/:id',
			templateUrl: '/components/addressBook/view/viewContact.ng.html',
			controller: 'AddressBookReadContactController'
		});
}]);
