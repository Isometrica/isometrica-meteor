var app = angular.module('isa.workinbox');

app.controller('WorkInboxController', function ($scope, $state, inboxItems, currentUser) {

  var vm = this;
  vm.currentUser = currentUser;
  vm.inboxItems = inboxItems;
  vm.actions = [];

  $scope.$meteorCollection(MeetingActions, false).subscribe('meeting-actions');
  $scope.$meteorAutorun(updateActions);

  vm.deleteAll = function() {
  	vm.inboxItems.remove();
  	$state.go('workinbox');
  };

  function updateActions() {
    vm.actions.length = 0;
    vm.actions = vm.inboxItems.concat(_.map(MeetingActions.find({inTrash: false}).fetch(), function (action) {
      return _.extend(action, { $type: 'meeting' });
    }));

  }
});
