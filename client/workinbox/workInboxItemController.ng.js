var app = angular.module('isa.workinbox');

app.controller('WorkInboxItemController', 
	function($scope, inboxItem) {

  var vm = this;
  vm.inboxItem = inboxItem;

} );