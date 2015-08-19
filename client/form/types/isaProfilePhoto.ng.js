angular
  .module('isa.form.types')
  .config(isaProfileImg);

function isaProfileImg(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaProfilePhoto',
    templateUrl: 'client/form/types/isaProfilePhoto.ng.html',
    controller: function($scope, $rootScope) {
      var files = $scope.$meteorCollectionFS(IsaFiles, false);
      $scope.$meteorSubscribe('files').then(function() {
        //if (imageDesc) {
          //$scope.image = IsaFiles.findOne(imageDesc._id);
        //}
      });
      $rootScope.$on($scope.form.name + '.submit', function() {
        if (!$scope.selectedFile) {
          files.save($scope.selectedFile).then(function(saved) {
            saved = saved._id;
            $scope.model[$scope.options.key] = {
              _id: saved._id,
              name: saved.name(),
              size: saved.size(),
              isImage: saved.isImage()
            };
          });
        }
      });
    },
    wrapper: [ 'hzLabel', 'bootstrapHasError']
  });
}
