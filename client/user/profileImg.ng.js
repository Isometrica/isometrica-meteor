'use strict';

angular
	.module('isa.user')
	.directive('isaProfileImg', isaProfileImgDirective)
	.directive('isaEditProfileImg', isaEditProfileImgDirective);

function isaEditProfileImgDirective() {
	return {
		templateUrl: 'client/user/editProfileImg.ng.html',
		restrict: 'E',
		require: '^form',
		link: function(scope, element, attrs, formCtrl){
			console.log('Link args ', arguments);
			var files = scope.$meteorCollectionFS(IsaFiles, false);
      scope.$meteorSubscribe('files').then(function() {
        //if (imageDesc) {
          //scope.image = IsaFiles.findOne(imageDesc._id);
        //}
      });
			console.log('Event name: ' + formCtrl.$name + '.submit');
      scope.$on(formCtrl.$name + '.submit', function() {
				console.log('Recieved event ', scope.selectedFiles);
        if (scope.selectedFiles && scope.selectedFiles.length) {
          files.save(scope.selectedFiles[0]).then(function(saved) {
						saved = saved[0]._id;
            scope.ngModel = {
              _id: saved._id,
              name: saved.name(),
              size: saved.size(),
              isImage: saved.isImage()
            };
          });
					console.log('Scope ', scope);
        }
      });
		},
		scope: {
			ngModel: '='
		}
	};
}

function isaProfileImgDirective() {
  return {
    restrict: 'E',
    replace: true,
    template: "<img class='img-circle pull-left' ng-src='{{ user.photoUrl() }}'/>",
    scope: {
      user: '='
    }
  };
}
