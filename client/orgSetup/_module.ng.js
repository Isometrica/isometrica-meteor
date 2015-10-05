angular
  .module('isa.orgSetup', ['ui.router'])
  .config(configureRoutes);

function configureRoutes($stateProvider) {
  $stateProvider
    .state('orgSetup', {
      url: '/setup',
      parent: 'organisation',
      templateUrl: 'client/orgSetup/orgSetupView.ng.html',
      controller: 'OrgSetupController',
      controllerAs: 'vm'
    });
}
