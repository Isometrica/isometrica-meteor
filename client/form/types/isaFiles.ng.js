angular
  .module('isa.form.types')
  .config(isaFilesType)
  .controller('isaFilesController', isaFilesController);

function isaFilesType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaFiles',
    templateUrl: 'client/form/types/isaFiles.ng.html',
    controller: 'isaFilesController'
  });
}

function isaFilesController($scope) {
  $scope.iconClass = function(file) {
    return isa.utils.getIconClassForFile(file.name);
  };

  $scope.remove = function(index) {
    $scope.model[$scope.options.key].splice(index, 1);
    $scope.fc.$setDirty(true);
  };

  $scope.upload = function(files) {
    _.each(files, function(file) {
      IsaFiles.insert(file, function(err, fileObj) {
        $scope.$apply(function() {
          if (!angular.isArray($scope.model[$scope.options.key])) {
            $scope.model[$scope.options.key] = [];
          }

          $scope.model[$scope.options.key].push({
            _id: fileObj._id,
            name: fileObj.name(),
            size: fileObj.size(),
            isImage: fileObj.isImage()
          });

          $scope.fc.$setDirty(true);
        });
      });
    });

  }


}
