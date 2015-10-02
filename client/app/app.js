
var app = angular.module('isa', [

  'isa.directives',

  'isa.overview',
  'isa.orgSetup',
  'isa.module',
  'isa.docwiki',
  'isa.workbook',
  'isa.addressbook',
  'isa.dashboard',
  'isa.workinbox',
  'isa.user',
  'isa.account',
  'isa.errs',
  'isa.substance',

  'angular-meteor',
  'ui.bootstrap',
  'ui.router',

  'angular-growl'
])
  .run(['$rootScope', '$window', function($rootScope, $window) {
      $rootScope.Schemas = $window.Schemas;
  }])
  .run(['$rootScope', function($rootScope) {
    var body = angular.element(document.querySelector('body'));
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

      var overviewClassess = 'has-bootcards-navbar-double isometrica-overview-page';
      if (toState.name == 'overview') {
        body.addClass(overviewClassess);
      } else {
        body.removeClass(overviewClassess);
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
