angular
  .module('isa.workbook.activity')
  .controller('ActivityController', ActivityController);

ActivityController.$inject = ['activity', 'isNew', '$modalInstance' ];
function ActivityController(activity, isNew, $modalInstance) {
  var vm = this;

  vm.activity = angular.copy(activity);
  vm.isNew = isNew;

  vm.addImpactType = function() {
    openImpactType({}, true);
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
    // tbd
  }
}
