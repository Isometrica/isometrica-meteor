'use strict';

angular
	.module('isa.addressbook')
	.directive('isaAspectFill', isaAspectFillDirective);

function isaAspectFillDirective() {
	return {
		restrict: 'A',
    require: '^isaViewPort',
    link: function(scope, elm, attrs, ctrl) {

      if (ctrl) {
        scope.maxWidth = ctrl.width();
        scope.maxHeight = ctrl.height();
        elm.addClass('isa-in-view-port');
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
