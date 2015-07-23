angular
  .module('isa.form.types')
  .config(isaDateType);

function isaDateType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaDate',
    templateUrl: 'client/form/types/isaDate.ng.html',
    wrapper: ['hzLabel', 'bootstrapHasError'],
    controller: isaDateController
  });
}

function isaDateController($scope) {
  $scope.openDatePicker = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };
}
