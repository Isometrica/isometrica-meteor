angular
  .module('isa.orgSetup')
  .controller('OrgSetupController', orgSetupController);

function orgSetupController($scope, organisation, $modal, growl) {
  var vm = this;
  vm.org = $scope.$meteorObject(Organisations, organisation._id, false);

  vm.editStrings = function(title, type) {
    var dlg = $modal.open({
      templateUrl: 'client/orgSetup/stringListDlg.ng.html',
      controller: 'StringListDlgController',
      controllerAs: 'dlg',
      windowClass: 'edit-item-details',
      backdrop: true,
      resolve: {
        title: function() { return title; },
        org: function() { return vm.org; },
        item: function() { return type; }
      }
    });

    dlg.result.then(function() {
      growl.info(title + ' saved');
    });
  }
}
