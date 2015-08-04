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

      //TODO: set correct username/ authorised by name

      //new issue: set the default authorised by name to the current user
      $scope.issue = {
        authorisedBy : $rootScope.currentUser.profile.fullName,
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
 * Controller for viewing an issue
 *
 * @author Mark Leusink
 */
app.controller('IssueController', [ '$scope', '$modal', '$state', '$stateParams', 'growl',
  function($scope, $modal, $state, $stateParams, growl) {

    $scope.issue = $scope.$meteorObject( DocwikiIssues, $stateParams.issueId, false).subscribe("docwikiIssues", $stateParams.moduleId);

    $scope.edit = function(issue) {

      var modalInstance = $modal.open({
        templateUrl: 'client/docWiki/issue/issueForm.ng.html',
        controller: 'IssueModalController',
        windowClass : 'docwiki',
        resolve: {
          isNew : function() {
            return false;
          },
          issue : function() {
            return DocwikiIssues.findOne( { _id : issue._id} );
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (data.reason === 'save') {

          $scope.issue.save( _.omit( data.issue, '_id') );

        } else if (data.reason === 'delete') {

          DocwikiIssues.remove( data.issue._id, function(err) {
            if (err) {
              growl.error(err);
            } else {
              growl.success("The issue has been deleted");
            }
            $state.go('docwiki.issues.list');
          });
          
        }
      }, function () {

      });
    };

  }
]);

/*
 * Controller for the list of issues in a DocWiki
 *
 * @author Mark Leusink
 */

app.controller('IssuesController', [ '$scope', '$state', '$stateParams',
  function($scope, $state, $stateParams) {

  $scope.setActiveList( {name : 'Issues', id: 'issues'} );

  $scope.$meteorSubscribe("docwikiIssues", $stateParams.moduleId).then( 

    function(subHandle) {
      $scope.issues = $scope.$meteorCollection(DocwikiIssues);
    }

  );

  $scope.issueDetails = function(id) {
    $state.go('docwiki.issues.detail', { issueId : id});
  };

}]);

