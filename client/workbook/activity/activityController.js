angular
  .module('isa.workbook.activity')
  .controller('ActivityController', ActivityController);

ActivityController.$inject = ['$scope', 'activity', 'isNew', '$modalInstance', '$modal' ];
function ActivityController($scope, activity, isNew, $modalInstance, $modal) {
  var vm = this;

  vm.activity = angular.copy(activity);
  vm.isNew = isNew;

  vm.addImpactType = function() {
    openImpactType({ values: [ 0, 0, 0, 0, 0, 0, 0, 0 ]}, true);
  };

  vm.addMitigation = function(impact) {
    openMitigation(impact, { values: [ 0, 0, 0, 0, 0, 0, 0, 0 ]}, true);
  };

  vm.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  vm.save = function (form) {
    if (form.$valid) {
      $modalInstance.close({reason: 'save', activity: vm.activity });
    }
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

  function openMitigation(impact, mitigation, isNew) {
    var modalInstance = $modal.open({
      templateUrl: 'client/workbook/activity/mitigation.ng.html',
      controller: 'EditMitigationController',
      controllerAs: 'vm',
      resolve: {
        mitigation: function () {
          return mitigation;
        },
        isNew : function() {
          return isNew;
        }
      }
    });

    modalInstance.result.then( function(result) {
      if (result.reason === 'save') {
        if (isNew) {
          if (!impact.mitigations) {
            impact.mitigations = [ result.mitigation ];
          }
          else {
            impact.mitigations.push(result.mitigation);
          }
        }
        else {
          angular.copy(result.mitigation, mitigation);
        }
      }
    });
  }
}
