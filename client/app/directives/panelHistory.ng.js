angular
  .module('isa.directives')
  .directive('panelHistory', panelHistoryDirective);

function panelHistoryDirective() {
  return {
    templateUrl: 'client/app/directives/panelHistory.ng.html',
    scope: {
      doc: '=for'
    },
    link: function(scope, elem, attr) {
      var historySub;

      scope.view = {
        isCollapsed: true,
        limit: 10,
        history: [],
        loading: false
      };

      scope.$watch('view.isCollapsed', function(isCollapsed) {
        if (!isCollapsed) {
          scope.loading = true;
          scope.view.history = scope.$meteorCollection(function() {
            return History.find({reference: scope.getReactively('doc._id')}, {sort: [['at', 'desc']]});
          }, false);
          scope.$meteorSubscribe('history', scope.getReactively('doc._id')).then(function(sub) {
            scope.view.loading=false;
            historySub = sub;
          })
        }
        else if (historySub) {
          scope.view.limit = 10;
          historySub.stop();
        }
      })
    }
  }
}
