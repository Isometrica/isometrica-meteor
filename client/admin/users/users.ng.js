var app = angular.module('isa.admin');

/*
 * Manage application users
 */
app.controller('UsersCtrl', function($scope, $meteor, growl) {

	var vm = this;

	$scope.$meteorSubscribe('users').then( function() {
		vm.users = $meteor.collection(Meteor.users);
	});

});
