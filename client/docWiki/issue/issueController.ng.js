var app = angular.module('isa.docwiki.reissue', [
  'isa.filters'
]);

/*
 * Re-issue a page: create a new document in the docwiki using the re-issue form
 */
app.directive('isaDocwikiReissue',
	['$rootScope', '$state', '$modal', 'growl',
	function($rootScope, $state, $modal, growl){

		return {

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

                var fullName = $rootScope.currentUser.profile.fullName;

                data.issue.documentId = $scope.docWiki._id;

                //add owner (current user) to the 'approved by' list
                data.issue.approvedBy = [
                  { _id: $rootScope.currentUser._id, fullName : fullName}
                ];

                DocwikiIssues.insert(data.issue, function(err, id) {

                  if (err) {

                    growl.error( "Error while creating issue" + err);

                  } else {

                    //issue created: send a notification to all approvers (owner + approvers)
                    //since the owner is the only one able to access the 'issue' function, we don't have to include him/her
                    //in the notification list

                    var _approvers = $scope.docWiki.approvers;    //all docwiki approvers
                    var approvers = [];

                    angular.forEach( _approvers, function(a) {
                      if (a._id !== $scope.docWiki.owner._id) {   //don't include the owner
                        approvers.push(a);
                      }
                    });

                    var issue = DocwikiIssues.findOne( { _id : id});
                    var msgIssueCreated = "Issue has been created with issue number " + issue.issueNo + ".";

                    if (approvers.length>0) {   //there are more approvers
                      
                      var pageLink = $state.href('docwiki.list', { 
                        moduleId : $scope.docWiki._id, listId : 'sections', 
                        action : 'approve', actionId : id}, {inherit: true, absolute: true} );

                      var approversIds = _.map( approvers, function(m){ return m._id;} );
                      var approversNames = _.map( approvers, function(m){ return m.fullName;} );

                      //send the 'approve this document' notification
                      MultiTenancy.call("sendToInboxById", "docwiki/email/approvedoc", approversIds, {
                          title : $scope.docWiki.title,
                          currentUser : fullName,
                          pageLink : pageLink
                      });

                      //set document status (not-approved)
                      $scope.docWiki.save( { 'status' : 'not-approved'}).then( function() {
                         growl.success(msgIssueCreated + " A notification has been sent to all document approvers: " + approversNames.join(', ') + "." );
                      }, function(err) {
                        growl.error('an error occured: ' + err);
                      });

                    } else {

                      //no additional approvers: change document status to 'approved'
                      $scope.docWiki.save( { 'status' : 'approved'}).then( function() {
                         growl.success(msgIssueCreated + " Document status is now 'approved'.");
                      }, function(err) {
                        growl.error('an error occured: ' + err);
                      });


                    }
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

