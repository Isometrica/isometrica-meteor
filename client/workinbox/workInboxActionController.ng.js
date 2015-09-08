angular
  .module('isa.workinbox')
  .controller('WorkInboxActionController', workInboxActionController);

function workInboxActionController($stateParams, $injector, $scope, action) {
  var vm = this;
  vm.action = action;
  if ('meeting' === $stateParams.type) {
    $scope.$watch('vm.action.meetingId', function(newVal) {
      vm.meeting = $scope.$meteorObject(Meetings, action.meetingId, false).subscribe('meeting', action.meetingId);
    });
  }

  vm.edit = function() {
    var factoryName = $stateParams.type + 'ActionDialog';
    var factory = $injector.get(factoryName);
    var dialog = factory(action._id);
  }
}
