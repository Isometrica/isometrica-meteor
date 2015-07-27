
var app = angular.module('isa', [

    'isa.overview',
    'isa.module',
    'isa.docwiki',
    'isa.workbook',
    'isa.addressbook',
    'isa.dashboard',

    'angular-meteor',
    'ui.bootstrap',
    'ui.router',

    'angular-growl'

])
  .run(['$rootScope', function($rootScope) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
          console.log("StateChangeError: ", error);
      });
  }])
  .run(['$rootScope', '$window', function($rootScope, $window) {
      $rootScope.Schemas = $window.Schemas;
  }])
  .run(['$rootScope', function($rootScope) {
    // Taken from:
    // https://bitbucket.org/markleusink/isometrica/src/f687698336fbb26e5b56a2422d9137245a5d57c7/client/app/controller.js?at=develop#cl-14
    //
    var body = angular.element(document.querySelector('body'));
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      if (toState.name == 'account.overview' || toState.name == 'overview' || toState.name == 'welcome') {
        body.addClass('has-bootcards-navbar-double');
      } else {
        body.removeClass('has-bootcards-navbar-double');
      }
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

app.config(['$logProvider', function($logProvider){
  $logProvider.debugEnabled(true);
}]);
