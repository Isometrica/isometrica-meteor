var app = angular.module('isa.docwiki.reissue', [
  'isa.filters'
]);

/*
 * Re-issue a page: create a new document in the docwiki using the re-issue form
 */
app.directive('isaDocwikiReissue',
	['$state', '$modal', 'growl',
	function($state, $modal, growl){

		return {

      scope : {
        'moduleId' : '@moduleId'
      },
			restrict: 'A',
      link : function($scope, elem) {

       		elem.bind('click', function () {

            var modalInstance = $modal.open({
	            templateUrl: 'client/docWiki/issue/issueForm.ng.html',
	            controller: 'IssueModalController',
	            windowClass : 'isometrica-wiki',
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

                DocwikiIssues.insert( data.issue, function(err, id) {

                  if (err) {
                    growl.error( "Error while creating issue" + err);
                  } else {
                    growl.success("Issue with number " + data.issue.issueNo + " has been created");
                  }

                });
              }
  	          }, function () {

  	        });

	        });
	      }

		};

}]);

/*
 * Controller for the issue form in a DocWiki
 *
 * @author  Mark Leusink
 */
app.controller('IssueModalController', [
  '$scope', '$rootScope', '$modal', '$modalInstance', 'isNew', 'issue',
  function($scope, $rootScope, $modal, $modalInstance, isNew, issue) {

    $scope.isNew = isNew;

    if (isNew) {

      //new issue: set the default authorised by name to the current user
      $scope.issue = {
        authorisedBy : {
          _id : $rootScope.currentUser._id,
          fullName : $rootScope.currentUser.profile.fullName
        },
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
        templateUrl: 'client/confirm/confirm.ng.html',
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

}]);

/*
 * Controller for the Issue history list in a DocWiki
 *
 * @author Mark Leusink
 */

app.controller('IssuesController', [ '$scope', '$meteor', '$state', '$stateParams', 'docWiki', 
  function($scope, $meteor, $state, $stateParams, docWiki) {

  $scope.issues = $meteor.collection(function(){
    return DocwikiIssues.find({ documentId : docWiki._id});
  });

  $scope.issueDetails = function(id) {
    $state.go('docwiki.issues.detail', { issueId : id});
  };

}]);

