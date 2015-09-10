angular
  .module('isa.actions.meeting')
  .service('meetingActions', meetingActionsFactory);

function meetingActionsFactory($modal) {
  return {
    editAction: editMeetingAction
  };

  function editMeetingAction(id) {
    return $modal.open({
      templateUrl: 'client/actions/meeting/meetingActionDlg.ng.html',
      controller: function($modalInstance, $scope, growl) {
        var vm = this;
        vm.action = Actions.findOne(id);
        vm.cancel = function() { $modalInstance.dismiss('cancel'); };
        vm.delete = function() {
          Actions.update(id, { $set: { inTrash: true } });
          $modalInstance.close({reason: 'delete', actionId: id, actionType: 'meeting' });
        };

        vm.save = function(form) {
          if (!form.$valid) {
            return;
          }

          Actions.update(id, { $set: {
            description: vm.action.description,
            targetDate: vm.action.targetDate,
            'status.value': vm.action.status.value,
            owner: vm.action.owner,
            notes: vm.action.notes
          }}, function (err) {
            if (err) {
              growl.error(err);
            }
            else {
              $modalInstance.close({reason: 'saved', actionId: id, actionType: 'meeting' })
            }
          });
        }
      },
      controllerAs: 'vm'
    })
  }
}
