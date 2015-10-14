angular
  .module('isa.orgSetup')
  .controller('OrgSetupController', orgSetupController);

function orgSetupController($scope, organisation, $modal, growl) {
  var vm = this;
  vm.org = $scope.$meteorObject(Organisations, organisation._id, false);

  vm.editMission = function() {
    var dlg = $modal.open({
      templateUrl: 'client/orgSetup/missionDlg.ng.html',
      controller: 'MissionDlgController',
      controllerAs: 'dlg',
      windowClass: 'edit-item-details',
      size: 'lg',
      backdrop: true,
      resolve: {
        org: function() { return vm.org; }
      }
    });
  };

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
        item: function() { return type; },
        textId: function() { return 'orgSetup/guidance/' + type }
      }
    });

    dlg.result.then(function() {
      growl.info(title + ' saved');
    });
  };

  vm.editMultiList = function(title, type, options) {
    var dlg = $modal.open({
      templateUrl: 'client/orgSetup/multiListDlg.ng.html',
      controller: 'MultiListDlgController',
      controllerAs: 'dlg',
      windowClass: 'edit-item-details',
      size: 'lg',
      backdrop: true,
      resolve: {
        title: function() { return title; },
        org: function() { return vm.org; },
        item: function() { return type; },
        typeOptions: function() { return options.split(','); },
        textId: function() { return 'orgSetup/guidance/' + type }
      }
    });

    dlg.result.then(function() {
      growl.info(title + ' saved');
    });
  }
}