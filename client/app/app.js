
var app = angular.module('isa', [
    'angular-meteor',
    'ui.bootstrap',
    'ui.router'
]);

var boot = function() {
    angular.bootstrap(document, [ 'isa' ]);
};

if (Meteor.isCordova) {
    angular.element(document).on("deviceready", boot);
} else {
    angular.element(document).ready(boot);
}
