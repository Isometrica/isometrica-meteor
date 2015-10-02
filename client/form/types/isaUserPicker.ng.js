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

function isaUserPickerController($scope, $meteor, $controller, $subs, initialsFilter) {

  $subs.needBind($scope, 'memberships');
  $scope.to.collectionNames = ["memberships"];

  $scope.transformFn = function(doc, name) {
    if (name === "memberships") {
      var user = doc.user();
      return _.extend(user.profile, { _id: user._id });
    }
    return _.extend(doc, { fullName: doc.name });
  };

  $controller('isaCollectionPickerController', {
    $scope: $scope,
    $meteor: $meteor
  });

}
