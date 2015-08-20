'use strict';

angular
	.module('isa.addressbook')
	.directive('isaImgViewPort', isaImgViewPortDirective);

function isaImgViewPortDirective() {
	return {
		restrict: 'E',
    replace: true,
    transclude: true,
    template: '<div class="isa-img-view-port" ng-transclude></div>',
    link: function(scope, elm, attrs) {
      // TODO: Set these styles properly
      elm.attr('max-width', scope.width);
      elm.attr('max-height', scope.height);
    },
		scope: {
			width: '@',
			height: '@'
		}
	};
}
