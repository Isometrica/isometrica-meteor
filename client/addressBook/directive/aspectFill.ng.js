'use strict';

angular
	.module('isa.addressbook')
	.directive('isaAspectFill', isaAspectFillDirective);

function isaAspectFillDirective() {
	return {
		restrict: 'A',
    link: function(scope, elm, attrs) {
      var wider   = elm.width() > elm.height(),
          width   = wider ? 'auto' : scope.maxWidth,
          height  = wider ? scope.maxHeight : 'auto';
      console.log('Width: ' + width + ', height: ' + height);          
      elm.attr('height', height);
      elm.attr('width', width);
    },
		scope: {
			maxWidth: '@',
			maxHeight: '@'
		}
	};
}
