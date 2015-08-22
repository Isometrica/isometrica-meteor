'use strict';

/**
 * @note To display profile images, a subscription to 'isaProfileImages'
 * must exist. Its recommended that you subscribe to this either in your
 * controller or at the route level.
 */
angular
	.module('isa.user')
	.directive('isaProfileImg', isaProfileImgDirective)
	.directive('isaEditProfileImg', isaEditProfileImgDirective);

function isaProfileImgDirective() {
	return {
		restrict: 'E',
		replace: true,
		link: function(scope, elm) {
			if (!scope.url) {
				scope.$meteorAutorun(function() {
					scope.image = scope.$meteorObject(IsaProfileImages, scope.getReactively('user.photo._id'));
				});
			}
		},
		templateUrl: 'client/user/viewProfileImg.ng.html',
		scope: {
			user: '=',
			url: '='
		}
	};
}

function isaEditProfileImgDirective() {
	return {
		templateUrl: 'client/user/editProfileImg.ng.html',
		restrict: 'E',
		require: '^form',
		link: function(scope, element, attrs, formCtrl) {
			var images = scope.$meteorCollectionFS(IsaProfileImages, false);
			scope.upload = function(files) {
				if (!files.length) {
					return;
				}
				scope.loading = true;
				images.save(files).then(function(res) {
					scope.file = res[0]._id;
					scope.user.photo = {
						_id: scope.file._id,
						name: scope.file.name(),
						size: scope.file.size()
					};
				});
			};
  	},
		scope: {
			user: '='
		}
	};
}
