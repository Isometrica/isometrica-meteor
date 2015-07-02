angular
  .module('isa.workbook.activity')
  .controller('EditMitigationController', EditMitigationController);

EditMitigationController.$inject = [ 'mitigation', 'isNew', '$modalInstance' ];
function EditMitigationController(mitigation, isNew, $modalInstance) {
  var vm = this;
  vm.mitigation = angular.copy(mitigation);
  vm.isNew = isNew;

  vm.title = function() {
    return !!vm.mitigation.name ? ('Mitigated by ' + vm.mitigation.name) : 'Mitigation';
  };

  vm.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  vm.delete = function() {
    $modalInstance.close({reason: 'delete'});
  };

  vm.save = function() {
    $modalInstance.close({reason: 'save', mitigation: vm.mitigation });
  }
}
