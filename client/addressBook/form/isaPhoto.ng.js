'use strict';

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
}

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
