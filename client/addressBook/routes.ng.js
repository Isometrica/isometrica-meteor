'use strict';

angular
	.module('isa.addressbook')
	.config(function($stateProvider) {
		$stateProvider
			.state('addressbook', {
				parent: 'organisation',
				url: '/addressbook',
				templateUrl: 'client/addressBook/view/addressBook.ng.html',
				controller: 'AddressBookController'
			})
			.state('addressbook.user', {
				url: '/user/:id',
				templateUrl: 'client/addressBook/view/viewUser.ng.html',
				controller: 'AddressBookViewUserController'
			})
			.state('addressbook.contact', {
				url: '/contact/:id',
				templateUrl: 'client/addressBook/view/viewContact.ng.html',
				controller: 'AddressBookViewContactController'
			});
	});
