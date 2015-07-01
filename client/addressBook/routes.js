'use strict';

var app = angular.module('isa.addressbook', [
	'ui.router',
	'ui.bootstrap',
	'infinite-scroll'
]);


/**
 * @author Steve Fortune
 */
app.config(['$stateProvider', function($stateProvider) {
	$stateProvider
		.state('addressbook', {
			parent: 'module',
			url: '/addressbook',
			templateUrl: '/components/addressBook/view/addressBook.html',
			controller: 'AddressBookController'
		})
	$stateProvider
		.state('addressbook.user', {
			url: '/user/:id',
			templateUrl: '/components/addressBook/view/viewUser.html',
			controller: 'AddressBookReadUserController'
		});
	$stateProvider
		.state('addressbook.contact', {
			url: '/contact/:id',
			templateUrl: '/components/addressBook/view/viewContact.html',
			controller: 'AddressBookReadContactController'
		});
}]);
