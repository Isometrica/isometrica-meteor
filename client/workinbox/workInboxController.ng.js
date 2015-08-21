var app = angular.module('isa.workinbox');

app.controller('WorkInboxController', function ($scope, $state, inboxItems) {

  var vm = this;
  vm.inboxItems = inboxItems;

  vm.deleteAll = function() {
  	vm.inboxItems.remove();
  	$state.go('workinbox');
  };

});