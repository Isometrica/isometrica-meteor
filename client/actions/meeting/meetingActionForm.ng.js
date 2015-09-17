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
    controller: function($scope, $log, $rootScope, firstLineFilter) {
      var owner = $scope.action.owner;
      $scope.isOwner = !owner || (owner._id == $rootScope.currentUser._id);

      $scope.configureForm = function(fields) {
        var haveId = !!$scope.action._id;
        fields[0].templateOptions.disabled = haveId;
        fields[3].templateOptions.disabled = haveId;

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
              fd.templateOptions.options = [{ _id: agenda._id, name: agenda.itemNo + ': ' + firstLineFilter(agenda.details) }];
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
              name: agendaItem.itemNo + ': ' + firstLineFilter(agendaItem.details),
              _id: agendaItem._id
            });
          });
        }
      }
    }
  }
}
