angular
  .module('isa.workbook.activity')
  .controller('EditImpactGradeController', ImpactGradeController);

ImpactGradeController.$inject = ['impact', 'span', '$modalInstance' ];
function ImpactGradeController(impact, span, $modalInstance) {
  var vm = this;
  vm.impact = impact;
  vm.span = span;
  vm.setValue = function(value) {
    $modalInstance.close(value);
  }
}
