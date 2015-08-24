'use strict';

angular
	.module('isa.addressbook')
	.directive('isaProfileImg', isaProfileImgDirective);

/**
 * @note To display profile images, a subscription to 'isaProfileImages'
 * must exist. Its recommended that you subscribe to this either in your
 * controller or at the route level.
 *
 * @param user  The user for which to construct a user to a profile img.
 * @param url   Pass a `url` to the directive to override the image
 *              displayed entirely
 */
function isaProfileImgDirective() {
	return {
		restrict: 'E',
		link: function(scope, elm) {
			scope.$meteorAutorun(function() {
				scope.image = IsaProfileImages.findOne(scope.getReactively('user.photo._id'));
			});
		},
		templateUrl: 'client/addressBook/view/profileImg.ng.html',
		scope: {
			user: '=',
			url: '='
		}
	};
}
