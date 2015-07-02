angular
  .module('isa.workbook.activity')
  .controller('ActivityController', ActivityController);

ActivityController.$inject = ['activity', 'isNew', '$modalInstance', '$modal' ];
function ActivityController(activity, isNew, $modalInstance, $modal) {
  var vm = this;

  vm.activity = angular.copy(activity);
  vm.isNew = isNew;

  vm.addImpactType = function() {
    openImpactType({ values: [ 0, 0, 0, 0, 0, 0, 0, 0 ]}, true);
  };

  vm.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  vm.save = function (form) {
    $modalInstance.close({reason: 'save', activity: vm.activity });
  };

  vm.delete = function() {
    $modalInstance.close({reason: 'delete', activity: vm.activity });
  };

  function openImpactType(impact, isNew) {
    var modalInstance = $modal.open({
      templateUrl: 'client/workbook/activity/impactType.ng.html',
      controller: 'EditImpactController',
      controllerAs: 'vm',
      resolve: {
        impact: function () {
          return impact;
        },
        isNew : function() {
          return isNew;
        }
      }
    });

    modalInstance.result.then( function(result) {
      if (result.reason === 'save') {
        if (isNew) {
          if (!vm.activity.impacts) {
            vm.activity.impacts = [ result.impact ];
          }
          else {
            vm.activity.impacts.push(result.impact);
          }
        }
        else {
          angular.copy(result.impact, impact);
        }
      }
    });
  }
}
