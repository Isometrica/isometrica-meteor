'use strict';

angular
	.module('isa.addressbook')
	.directive('isaAspectFill', isaAspectFillDirective);

function isaAspectFillDirective() {
	return {
		restrict: 'A',
    require: '^?isaImgViewPort',
    link: function(scope, elm, attrs, ctrl) {

      if (!scope.maxWidth && ctrl) {
        scope.maxWidth = ctrl.width;
      }
      if (!scope.maxHeight && ctrl) {
        scope.maxHeight = ctrl.height;
      }

      elm.load(function() {
        var wider   = elm.width() > elm.height(),
            width   = wider ? 'auto' : scope.maxWidth,
            height  = wider ? scope.maxHeight : 'auto';
        elm.attr('height', height);
        elm.attr('width', width);
      });

    },
		scope: {
			maxWidth: '@',
			maxHeight: '@'
		}
	};
}
