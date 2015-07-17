angular
  .module('isa.workbook', [
    'isa.workbook.activity'
  ])
  .config(configureRoutes);

function configureRoutes($stateProvider) {
  $stateProvider
    .state('workbook', {
      url: '/workbook',
      parent: 'module',
      templateUrl: 'client/workbook/workbookView.ng.html',
      controller: 'WorkbookController',
      controllerAs: 'vm',
      resolve: {
        activitySub: ['$meteor', 'module', function($meteor, module) {
          console.log("activitySub:", module);
          return $meteor.subscribe('workbook-activities', module._id);
        }],
        activities: ['$meteor', 'module', 'activitySub', function($meteor, module) {
          return $meteor.collection(function() {
            return WorkbookActivities.find({ moduleId: module._id });
          }, false);
        }]
      }
    });
}
