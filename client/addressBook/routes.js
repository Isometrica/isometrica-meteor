'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.config(['$stateProvider', function($stateProvider) {
	$stateProvider
		.state('addressbook', {
			parent: 'base',
			url: '/addressbook',
			templateUrl: 'client/addressBook/view/addressBook.ng.html',
			controller: 'AddressBookController'
		})
	/*$stateProvider
		.state('addressbook.user', {
			url: '/user/:id',
			templateUrl: 'client/addressBook/view/viewUser.ng.html'
			//controller: 'AddressBookReadUserController'
		});
	$stateProvider
		.state('addressbook.contact', {
			url: '/contact/:id',
			templateUrl: 'client/addressBook/view/viewContact.ng.html'
			//controller: 'AddressBookReadContactController'
		});*/
}]);
