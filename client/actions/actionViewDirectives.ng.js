angular
  .module('isa.actions')
  .directive('actionViewHeader', actionViewHeaderDirective)
  .directive('actionViewFooter', actionViewFooterDirective);

function actionViewHeaderDirective() {
  return {
    templateUrl: 'client/actions/actionViewHeader.ng.html',
    scope: {
      action: '=',
      title: '@'
    },
    controller: function($rootScope, $scope, $injector) {
      var vm = this;
      vm.edit = function() {
        var factoryName = $scope.action.type + 'Actions';
        var factory = $injector.get(factoryName);
        factory.editAction($scope.action._id);
      };
      vm.isNotOwner = function(action) {
        return action.owner._id !== $rootScope.currentUser._id;
      };
    },
    controllerAs: 'vm'
  }
}

function actionViewFooterDirective() {
  return {
    templateUrl: 'client/actions/actionViewFooter.ng.html',
    scope: {
      action: '='
    }
  }
}
