angular
  .module('isa.workbook.activity')
  .controller('EditImpactController', EditImpactController);

function EditImpactController(impact, isNew, $modalInstance) {
  var vm = this;
  vm.impact = angular.copy(impact);
  vm.isNew = isNew;

  vm.title = function() {
    return !!vm.impact.name ? (vm.impact.name + ' impacts of disruption') : 'Impact';
  };

  vm.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  vm.delete = function() {
    $modalInstance.close({reason: 'delete'});
  };

  vm.save = function() {
    $modalInstance.close({reason: 'save', impact: vm.impact });
  }
}
