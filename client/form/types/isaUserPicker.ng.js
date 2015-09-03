angular
  .module('isa.form.types')
  .config(isaUserPicker)
  .controller('isaUserPickerController', isaUserPickerController)
  .filter('initials', initialsFilter);

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

function isaUserPickerController($scope, initialsFilter) {
  $scope.optionLabel = function(user) {
    return user && (user.fullName + ' (' + user.initials + ')');
  };
  $scope.customUser = function(val) {
    if ($scope.to.userTypes && -1 == _.indexOf($scope.to.userTypes, 'Other')) {
      return undefined;
    }

    return {
      fullName: val,
      initials: initialsFilter(val),
      type: 'Other'
    }
  };

  $scope.users = [];

  $scope.$meteorAutorun(function() {
    var rawUsers = Memberships.find({}).fetch();
    var rawContacts = Contacts.find({}).fetch();
    updateUsers(rawUsers, rawContacts);
  });

  $scope.$meteorCollection(Memberships, false).subscribe('memberships');
  $scope.$meteorCollection(Contacts, false).subscribe('contacts');

  function updateUsers(rawUsers, rawContacts) {
    $scope.users.length = 0;
    if (!$scope.to.userTypes || -1 != _.indexOf($scope.to.userTypes, 'User')) {
      _.each(rawUsers, function(doc) {
        var user = doc.user();
        $scope.users.push({
          _id: user._id,
          fullName: user.profile.fullName,
          initials: user.profile.initials,
          type: 'User'
        });
      });
    }

    if (!$scope.to.userTypes || -1 != _.indexOf($scope.to.userTypes, 'Contact')) {
      _.each(rawContacts, function(doc) {
        $scope.users.push({_id: doc._id, fullName: doc.name, initials: initialsFilter(doc.name), type: 'Contact'});
      });
    }

  }
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
