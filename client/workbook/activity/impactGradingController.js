angular
  .module('isa.workbook.activity')
  .controller('EditImpactGradeController', ImpactGradeController);

ImpactGradeController.$inject = ['title', 'span', '$modalInstance' ];
function ImpactGradeController(title, span, $modalInstance) {
  var vm = this;
  vm.title = title;
  vm.span = span;
  vm.setValue = function(value) {
    $modalInstance.close(value);
  }
}
