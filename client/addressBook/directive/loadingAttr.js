'use strict';

var app = angular.module('isa.addressbook');

/**
 * @author Steve Fortune
 */
app.directive('loadingAttr', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		require: '^loading',
		compile: function() {
			return function(scope, elm, attrs, loadingCtrl) {
				var loadingStr = scope.loadingMsg || '<span style="color:#aaa"><i class="fa fa-clock-o"></i>Loading...</span>';
				var noneStr = scope.noneMsg || 'None';
				scope.$watch(function() {
					return scope.value || scope.$parent.hasLoaded;
				}, function() {
					if (scope.$parent.hasLoaded) {
						if (!scope.value || !scope.value.trim()) {
							elm.html(noneStr);
						} else {
							elm.html(scope.value);
						}
					} else {
						elm.html(loadingStr);
					}
				});
			};
		},
		scope: {
			value: '=',
			loadingMsg: '@',
			noneMsg: '@'
		}
	};
}]);
