angular
  .module('isa.workbook.activity')
  .controller('EditImpactController', EditImpactController);

EditImpactController.$inject = [ 'impact', 'isNew', '$modalInstance' ];
function EditImpactController(impact, isNew, $modalInstance) {
  var vm = this;
  vm.impact = angular.copy(impact);
  vm.isNew = isNew;

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
