'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaAddressBookPanel', [function() {
	return {
    templateUrl: 'client/overview/addressBookPanel.ng.html',
		restrict: 'E'
	};
}]);
