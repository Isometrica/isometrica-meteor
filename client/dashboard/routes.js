'use strict';

var app = angular.module('isa.dashboard');

/**
 * 

 */
app.config(['$stateProvider', function($stateProvider) {

	$stateProvider
		.state('dashboard', {
			parent: 'organisation',
			url: '/dashboard',
			templateUrl: 'client/dashboard/dashboardView.ng.html',
			controller: 'DashboardController',
			controllerAs : 'vm'
		});
	
}]);
