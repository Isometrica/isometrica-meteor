angular
  .module('isa.dashboard.meetings')
  .directive('isaMeetingActionCard', isaMeetingActionCard)
  .controller('isaMeetingActionCardController', isaMeetingActionCardController);

function isaMeetingActionCard() {
  return {
    templateUrl: 'client/dashboard/meetings/isaMeetingActionCard.ng.html',
    scope: {
      action: '=',
      agendaItems: '=',
      previous: '@',
      save: '&'
    },
    controller: 'isaMeetingActionCardController'
  }
}

function isaMeetingActionCardController($scope) {
  $scope.configureForm = function(fields) {
    var fd = _.findWhere(fields, {key: 'agendaItem'});
    if (!fd) {
      return;
    }

    $scope.$watch('agendaItems', function(newValue) {
      updateAgendaSelect(fd, newValue);
    }, true);

    function updateAgendaSelect(fd, items) {
      fd.type = 'isaSelect';
      fd.templateOptions.valueProp = '_id';
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
  };
}
