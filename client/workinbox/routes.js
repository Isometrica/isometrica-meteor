'use strict';

var app = angular.module('isa.workinbox');

/**
 * 

 */
app.config(['$stateProvider', function($stateProvider) {

	$stateProvider
		.state('workinbox', {
			parent: 'organisation',
			url: '/workinbox',
			templateUrl: 'client/workinbox/workInboxView.ng.html',
			controller: 'WorkInboxController',
			controllerAs : 'vm'
		});
	
}]);
