
var app = angular.module('isa', [

    'isa.overview',
    'isa.module',
    'isa.docwiki',

    'angular-meteor',
    'ui.bootstrap',
    'ui.router',

    'angular-growl'

]);

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