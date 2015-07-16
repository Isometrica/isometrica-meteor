
var app = angular.module('isa', [

    'isa.overview',
    'isa.module',
    'isa.docwiki',
    'isa.workbook',
    'isa.addressbook',

    'angular-meteor',
    'ui.bootstrap',
    'ui.router',

    'angular-growl'

])
  .run(['$rootScope', function($rootScope) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
          console.log("StateChangeError: ", error);
      });
  }]);

var boot = function() {
    angular.bootstrap(document, [ 'isa' ]);
};

if (Meteor.isCordova) {
    angular.element(document).on("deviceready", boot);
} else {
    angular.element(document).ready(boot);
}

app.config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalDisableCountDown(true);
}]);
