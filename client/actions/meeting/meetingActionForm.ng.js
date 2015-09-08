angular
  .module('isa.actions.meeting')
  .directive('meetingActionForm', meetingActionFormDirective)
  .factory('meetingActionDialog', meetingActionDialogFactory);

function meetingActionDialogFactory($modal) {
  return function(id) {
    return $modal.open({
      templateUrl: 'client/actions/meeting/meetingActionDlg.ng.html',
      controller: function($modalInstance, $scope, growl) {
        var vm = this;
        vm.action = MeetingActions.findOne(id);
        vm.cancel = function() { $modalInstance.dismiss('cancel'); };
        vm.delete = function() {
          MeetingActions.update(id, { $set: { inTrash: true } });
          $modalInstance.close({reason: 'delete', actionId: id, actionType: 'meeting' });
        };

        vm.save = function(form) {
          if (!form.$valid) {
            return;
          }

          MeetingActions.update(id, { $set: {
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

function meetingActionFormDirective() {
  return {
    templateUrl: 'client/actions/meeting/meetingActionForm.ng.html',
    scope: {
      action: '=',
      agendaItems: '=',
      previous: '@'
    },
    controller: function($scope) {
      $scope.configureForm = function(fields) {
        var fd = _.findWhere(fields, {key: 'agendaItem'});
        if (!fd) {
          return;
        }

        fd.type = 'isaSelect';
        fd.templateOptions.valueProp = '_id';

        if (!$scope.agendaItems) {
          fd.templateOptions.disabled = true;
          fd.templateOptions.options = [];
          $scope.$meteorAutorun(function() {
            var agenda = AgendaItems.findOne({_id: $scope.getReactively('action.agendaItem')});
            if (agenda) {
              fd.templateOptions.options = [{ _id: agenda._id, name: agenda.itemNo + ': ' + agenda.details }];
            }
          });
          $scope.$meteorSubscribe('meeting-details', $scope.action.meetingId);
          return;
        }

        $scope.$watch('agendaItems', function(newValue) {
          updateAgendaSelect(fd, newValue);
        }, true);

        function updateAgendaSelect(fd, items) {
          if ('true' === $scope.previous) {
            fd.templateOptions.disabled = true;
          }

          fd.templateOptions.options = [];
          _.each(items, function(agendaItem) {
            fd.templateOptions.options.push({
              name: agendaItem.itemNo + ': ' + agendaItem.details,
              _id: agendaItem._id
            });
          });
        }
      }
    }
  }
}
