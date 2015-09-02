'use strict';

// @note This file doesn't seem to be transformed correctly by ngAnnotate.
// I get a provider error when I use .ng.js and remove the $inject property.
// Not sure whether its an omission on my part, but for now I've reverted
// to using $inject for a quick-fix.

angular
	.module('isa.addressbook')
	.config(isaPhoto);

function isaPhotoController($scope, $rootScope) {
	var images = $scope.$meteorCollectionFS(IsaProfileImages, false);
	$scope.upload = function(files) {
		if (!files.length) {
			return;
		}
		images.save(files).then(function(res) {
			$scope.file = res[0]._id;
			$scope.model[$scope.options.key] = {
				_id: $scope.file._id,
				name: $scope.file.name(),
				size: $scope.file.size()
			};
		});
	};
	if (!$scope.model.defaultPhotoUrl) {
		Schemas.IsaProfilePhoto.clean($scope.model);
	}
}
isaPhotoController.$inject = [ '$scope', '$rootScope' ];

function isaPhoto(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaPhoto',
    templateUrl: 'client/addressBook/form/isaPhoto.ng.html',
    defaultOptions: {
      className: 'form-group avatar'
    },
    controller: isaPhotoController,
    wrapper: [ 'hzLabel', 'bootstrapHasError' ]
  });
}
isaPhoto.$inject = [ 'formlyConfigProvider' ];
