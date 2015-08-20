'use strict';

angular
	.module('isa.addressbook')
	.directive('isaViewPort', isaViewPortDirective);

function isaViewPortDirective() {
	return {
		restrict: 'A',
    controller: function($scope) {
      this.width = function() {
        return $scope.width;
      };
      this.height = function() {
        return $scope.height;
      };
    },
    link: function(scope, elm, attrs) {
      elm.addClass('isa-img-view-port');
      elm.css('max-width', scope.width);
      elm.css('max-height', scope.height);
      elm.css('width', scope.width);
      elm.css('height', scope.height);
    },
		scope: {
			width: '@',
			height: '@'
		}
	};
}
