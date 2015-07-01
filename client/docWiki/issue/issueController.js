var app = angular.module('isa.docwiki.reissue', [
  'isa.docwiki.reissue.factories'
]);

//inject a function into the $httpProvider that will transform iso8601 date strings into Date objects
app.config(["$httpProvider", function ($httpProvider) {
     $httpProvider.defaults.transformResponse.push(function(responseData){
        isa.utils.isoDateStringsToDates(responseData);
        return responseData;
    });
}]);

/*
 * Re-issue a page: create a new document in the docwiki using the re-issue form
 */
app.directive('isaDocwikiReissue',
	['$state', 'Page', 'IssueFactory', '$modal', 'growl',
	function($state, Page, IssueFactory, $modal, growl){

		return {

      scope : {
        'moduleId' : '@moduleId'
      },

			restrict: 'A',
      		link : function($scope, elem) {

       		elem.bind('click', function () {

            var modalInstance = $modal.open({
	            templateUrl: 'components/docWiki/issue/issueForm.html',
	            controller: 'IssueModalController',
	            windowClass : 'docwiki',
	            resolve: {
                isNew : function() {
                  return true;
                },
                issue : function() {
                  return { };
                }
              }
	          });

	          modalInstance.result.then(function (data) {
	            if (data.reason === 'save') {
                data.issue.documentId = $scope.moduleId;
                IssueFactory.create(data.issue).then( function(res) {
                  growl.success("Issue with number " + res.issueNo + " has been created");
                });
              }
	          }, function () {

	          });

	        });
	      }

		};

}]);

/*
 * Controller for the ssue form
 *
 * @author  Mark Leusink
 */
app.controller('IssueModalController', [
  '$scope', '$rootScope', 'IssueFactory', '$modal', '$modalInstance', 'isNew', 'issue',
  function($scope, $rootScope, IssueFactory, $modal, $modalInstance, isNew, issue) {

    $scope.isNew = isNew;

    if (isNew) {

      //new issue: set the default authorised by name to the current user
      $scope.issue = {
        authorisedBy : $rootScope.currentUser().name,
        issueDate : new Date()
      };

    } else {

      $scope.issue = issue;

    }

    $scope.cancelEdit = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.save = function(isValid) {
      if (!isValid) {
        return;
      } else {
        $modalInstance.close({reason: 'save', issue : $scope.issue });
      }
    };

    $scope.delete = function(issue) {

      //show confirm dialog to delete the issue
      $modal.open({
        templateUrl: 'components/coreSystem/confirm/confirmModal.html',
        controller : 'ConfirmModalController',
        resolve: {
          title: function() {
            return 'Are you sure you want to remove this issue?';
          },
        },
      }).result.then(function(confirmed) {
        if (confirmed) {
          $modalInstance.close({ reason: 'delete', issue: $scope.issue });
        }
      });

    };

    //date picker functions
    $scope.openDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

}]);

/*
 * Controller for viewing an issue
 *
 * @author Mark Leusink
 */
app.controller('IssueController', [ '$scope', '$modal', '$state', '$stateParams', 'IssueFactory', 'CurrentUser',
  function($scope, $modal, $state, $stateParams, IssueFactory, CurrentUser) {

    $scope.issue = IssueFactory.findById( $stateParams.issueId);

    $scope.edit = function(issue) {

      issue = angular.copy(issue);

      var modalInstance = $modal.open({
        templateUrl: 'components/docWiki/issue/issueForm.html',
        controller: 'IssueModalController',
        windowClass : 'docwiki',
        resolve: {
          isNew : function() {
            return false;
          },
          issue : function() {
            return IssueFactory.findById( $stateParams.issueId);
          },
          CurrentUser: function() {
            return CurrentUser;
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (data.reason === 'save') {
          IssueFactory.save(data.issue);
          $state.reload(true);
        } else if (data.reason === 'delete') {
           IssueFactory.delete(data.issue.id);
          $state.go('docwiki.issues');
        }
      }, function () {

      });
    };

  }
]);

app.controller('IssuesController', [ '$scope', '$state', '$stateParams', 'IssueFactory',
  function($scope, $state, $stateParams, IssueFactory) {

  $scope.issues = IssueFactory.all($stateParams.moduleId);

  $scope.issueDetails = function(id) {
    $state.go('docwiki.issue', { issueId : id});
  };

}]);
