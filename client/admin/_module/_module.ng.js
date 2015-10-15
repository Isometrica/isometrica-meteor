var app = angular.module('isa.admin', [
	'ui.router'
	]);

app.controller('AdminDashboardCtrl', function($state, $meteor){

	//counters for users & documents
	var vm = this;

	$meteor.subscribe('PubUserCounter')
	.then( function(subHandle) {
		vm.numUsers = Counts.get('userCounter');
	});

	$meteor.subscribe('PubDocCounter')
	.then( function(subHandle) {
		vm.numDocuments = Counts.get('docCounter');
	});

});
