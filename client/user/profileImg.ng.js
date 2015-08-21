'use strict';

/**
 * @note To display profile images, a subscription to 'isaProfileImages'
 * must exist. Its recommended that you subscribe to this either in your
 * controller or at the route level.
 */
angular
	.module('isa.user')
	.service('isaProfileImages', isaProfileImages)
	.directive('isaProfileImg', isaProfileImgDirective)
	.directive('isaEditProfileImg', isaEditProfileImgDirective);

function isaProfileImages($meteor) {
	return {
		files: $meteor
			.collectionFS(IsaProfileImages, false)
			.subscribe('profileImages')
	};
}

function isaProfileImgDirective() {
	return {
		restrict: 'E',
		replace: true,
		template: "<img class='img-circle pull-left' src='{{ url }}'/>",
		scope: {
			url: '='
		}
	};
}

function isaEditProfileImgDirective(isaProfileImages) {
	return {
		templateUrl: 'client/user/editProfileImg.ng.html',
		restrict: 'E',
		require: '^form',
		link: function(scope, element, attrs, formCtrl){
			scope.upload = function(files) {
				console.log('Upload..', arguments);
				if (!files.length) {
					return;
				}
				console.log('files');
				isaProfileImages.files.save(files).then(function(res) {
					console.log('Uploaded', arguments);
					scope.file = res[0]._id;
					scope.user.profile.photo = {
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
