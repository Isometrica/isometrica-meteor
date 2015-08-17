angular
  .module('isa.form.types')
  .config(isaUserPicker)
  .controller('isaUserPickerController', isaUserPickerController)
  .filter('initials', initialsFilter);

function isaUserPicker(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaUser',
    templateUrl: 'client/form/types/isaUserPicker.ng.html',
    wrapper: ['hzLabel', 'isaHasError'],
    controller: 'isaUserPickerController'
  });
}

function isaUserPickerController($scope, initialsFilter) {
  console.log('user picker scope', $scope);
  $scope.optionLabel = function(user) {
    return user && (user.fullName + ' (' + initialsFilter(user.fullName) + ')');
  };

  $scope.rawUsers = $scope.$meteorCollection(Memberships, false).subscribe('memberships');
  $scope.users = [];
  $scope.$watch('rawUsers', function(newValue) {
    if (newValue) {
      $scope.users.length = 0;
      _.each(newValue, function(doc) {
        var user = doc.user();
        $scope.users.push({ _id: user._id, fullName: user.profile.fullName, initials: initialsFilter(user.profile.fullName) });
      })
    }
  })
}

function initialsFilter() {
  return function(name, altText) {
    if (!name || typeof name !== 'string') {
      return altText || '';
    }

    var parts = name.toUpperCase().split(' ');
    var answer = '';
    if (0 != parts.length) {
      answer += parts[0].charAt(0);
    }
    if (parts.length > 0) {
      answer += parts[parts.length - 1].charAt(0);
    }

    return answer;
  }
}
