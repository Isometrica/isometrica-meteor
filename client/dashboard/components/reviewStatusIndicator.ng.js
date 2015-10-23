angular
  .module('isa.dashboard.components')
  .directive('reviewStatusIndicator', reviewStatusIndicatorDirective);

function reviewStatusIndicatorDirective() {
  return {
    template: '<span class="label"></span>',
    scope: {
      status: '='
    },
    link: function(scope, elem) {
      var span = angular.element(elem.children()[0]);
      scope.$watch('status', function(val) {
        switch (val) {
          case 'reviewed':
            span.removeClass('label-warning label-danger').addClass('label-success');
            span.html('Reviewed');
            break;

          case 'awaiting':
            span.removeClass('label-success label-danger').addClass('label-warning');
            span.html('Awaiting review');
            break;

          case 'overdue':
            span.removeClass('label-success label-warning').addClass('label-danger');
            span.html('Overdue');
            break;

          default:
            span.removeClass('label-success label-warning label-danger');
            span.html('');
        }
      })
    }
  }
}
