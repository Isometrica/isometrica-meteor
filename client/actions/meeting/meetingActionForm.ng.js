angular
  .module('isa.actions.meeting')
  .directive('meetingActionForm', meetingActionFormDirective);

function meetingActionFormDirective() {
  return {
    templateUrl: 'client/actions/meeting/meetingActionForm.ng.html',
    scope: {
      action: '=',
      agendaItems: '=',
      previous: '@'
    },
    controller: function($scope, $log) {
      $scope.configureForm = function(fields) {
        var fd = _.findWhere(fields, {key: 'agendaItem'});
        if (!fd) {
          $log.warn('No agendaItem field definition could be found');
          return;
        }

        fd.type = 'isaSelect';
        fd.templateOptions.valueProp = '_id';
        fd.templateOptions.options = [];

        if (!$scope.agendaItems) {
          fd.templateOptions.disabled = true;
          $scope.$meteorAutorun(function() {
            var agenda = AgendaItems.findOne({_id: $scope.getReactively('action.meeting.agendaItem')});
            if (agenda) {
              fd.templateOptions.options = [{ _id: agenda._id, name: agenda.itemNo + ': ' + agenda.details }];
            }
          });
          $scope.$meteorSubscribe('meeting-details', $scope.action.meeting.meetingId);
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
