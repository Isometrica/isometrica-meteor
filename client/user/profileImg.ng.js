'use strict';

angular
	.module('isa.user')
	.directive('isaProfileImg', isaProfileImgDirective);

function isaProfileImgDirective() {
  return {
    restrict: 'E',
    replace: true,
    template: '<img class="img-circle pull-left" src="{{ user.profile.imageUrl }}">',
    scope: {
      user: '='
    }
  };
}
