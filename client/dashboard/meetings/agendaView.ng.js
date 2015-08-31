angular
  .module('isa.dashboard.meetings')
  .directive('agendaView', agendaViewDirective);

function agendaViewDirective() {
  return {
    scope: {
      agenda: '='
    },
    templateUrl: 'client/dashboard/meetings/agendaView.ng.html',
    controller: function($scope) {
      var parts = $scope.agenda.details ? $scope.agenda.details.split('\n') : [];
      $scope.agendaSubs = [];
      if (parts.length) {
        for (var x = 1; x < parts.length; x++) {
          var sub = parts[x].trim();
          if (sub.indexOf('-') === 0) {
            sub = sub.substring(1).trim();
          }
          $scope.agendaSubs.push(sub);
        }
      }
    }
  }
}
