angular
  .module('isa.workbook')
  .controller('WorkbookController', WorkbookController);

WorkbookController.$inject = ['module', 'activities', '$modal'];
function WorkbookController(module, activities, $modal) {
  var vm = this;

  vm.workbook = module;
  vm.activities = activities;//dao.aops.all($stateParams.planId, $scope);

  vm.addActivity = function() {
    openActivity({moduleId: module._id}, true);
  };

  vm.editActivity = function(activity) {
    openActivity(activity, false);
  };

  function openActivity(activity, isNew) {
    var modalInstance = $modal.open({
      templateUrl: 'client/workbook/activity/activity.ng.html',
      controller: 'ActivityController',
      controllerAs: 'vm',
      resolve: {
        activity: function() {
          return activity;
        },
        isNew: function() {
          return isNew;
        }
      }
    });

    modalInstance.result.then(function(result) {
      if (!result) {
        return;
      }

      if (result.reason === 'save') {
        return vm.activities.save(result.activity);
      }
      else if (result.reason === 'delete') {
        vm.activities.remove(result.activity._id);
      }
    })
      .catch(function(nope) {
        console.log("Nope:", nope);
      });
  }
}
