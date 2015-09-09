angular
  .module('isa.workinbox')
  .controller('WorkInboxActionController', workInboxActionController);

function workInboxActionController($stateParams, $injector, $scope, action) {
  var vm = this;
  vm.action = action;

  vm.edit = function() {
    var factoryName = $stateParams.type + 'Actions';
    var factory = $injector.get(factoryName);
    var dialog = factory.editAction(action._id);
  }
}
