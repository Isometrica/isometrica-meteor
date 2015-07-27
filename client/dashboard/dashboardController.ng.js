angular
  .module('isa.dashboard')
  .controller('DashboardController', DashboardController);

function DashboardController(organisation) {

  var vm = this;

  vm.org = organisation;

  vm.welcome = 'Dashboard placeholder page';

}
