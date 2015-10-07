angular
  .module('isa.actions')
  .directive('isaActionStatus', isaActionStatusDirective);

function isaActionStatusDirective() {
  return {
    restrict: 'E',
    replace: true,
    template: '<span class="label"></span>',
    link: function(scope, elem, attr) {
      if (!attr.label) {
        elem.addClass('status-indicator');
      }

      if (attr.action) {
        var _stub = {};
        scope.$watch(function() {
          var action = scope.$eval(attr.action);
          _stub.status = action.status;
          _stub.targetDate = action.targetDate;
          return _stub;
        }, updateAction, true);
        function updateAction(action) {
          if (!action.status) {
            elem.hide();
            return;
          }

          elem.show();
          elem.removeClass('label-info label-success label-danger label-warning');
          var text = '';

          if (action.status.value === 'canceled') {
            elem.addClass('label-info');
            text = 'Canceled';
          }
          else if (action.status.value === 'closed') {
            elem.addClass('label-success');
            text = 'Closed';
          }
          else if (!action.status.hasPlan) {
            elem.addClass('label-danger');
            text = 'Open - No plan';
          }
          else if (action.targetDate && moment(action.targetDate).isBefore(new Date())) {
            elem.addClass('label-danger');
            text = 'Open - Overdue';
          }
          else {
            elem.addClass('label-warning');
            text = 'Open - In progress'
          }

          if (attr.label === 'true') {
            elem.html(text);
          }
          else if (attr.label) {
            elem.html(attr.label);
          }
        }
      }
    }
  }
}
