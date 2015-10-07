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

/**
 * @extends isaCollectionPickerController
 */
function isaUserPickerController($scope, $meteor, $controller, $subs, initialsFilter) {

  // Uncomment out to support contacts, too.
  // $subs.needBind($scope, 'contacts');
  $subs.needBind($scope, 'memberships');
  $subs.needBind($scope, 'profileImages');

  // Uncomment out and include some additional boolean logic to support
  // contacts where required.
  $scope.to.collectionNames = ["memberships"/*, "contacts"*/];

  $scope.transformFn = function(doc, name) {
    if (name === "memberships") {
      var user = doc.user();
      return {_id: user._id, fullName: user.profile.fullName, type: 'User', initials: user.profile.initials };
      //return _.pick(user, '_id', 'fullName');
      //return _.extend(user.profile, { _id: user._id });
    }
    return _.extend(doc, { fullName: doc.name });
  };

  $controller('isaCollectionPickerController', {
    $scope: $scope,
    $meteor: $meteor
  });

}
