angular
  .module('isa.form.types')
  .config(isaUserPicker)
  .controller('isaUserPickerController', isaUserPickerController);

function isaUserPicker(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaUser',
    templateUrl: function(formlyConfig) {
      var isMultiple = (formlyConfig.templateOptions.selectMultiple == true);
      return 'client/form/types/isaUserPicker' + (isMultiple ? 'Multiple' : '') + '.ng.html';
    },
    wrapper: ['hzLabel', 'isaHasError'],
    controller: 'isaUserPickerController'
  });
}

function isaUserPickerController($scope, $meteor, $controller, initialsFilter) {

  // @todo Depending on which ones are requested
  $scope.cols = ["users", "contacts"];

  $scope.transformFn = function(doc, type) {
    var val = doc.fullName;
    return {
      _id: doc._id,
      fullName: val,
      initials: initialsFilter(val)
    };
  };

  $controller('isaCollectionPickerController', {
    $scope: $scope,
    $meteor: $meteor
  });

}
