
var app = angular.module('isa.docwiki');

/*
 * Controller for a page in a DocWiki. Includes the code to compare 2 versions of a page.
 *
 * @author Mark Leusink
 */
app.controller('PageController',
	function($scope, $rootScope, $state, $stateParams, $meteor, $modal, $controller, isNew, docWiki, growl) {	

	$scope.showChanges = $state.current.name.indexOf('changes')>-1;

	$scope.moduleId = $stateParams.moduleId;
	$scope.pageId = $stateParams.pageId;
	$scope.pageInfoCollapsed = true;

	if ($stateParams.action == 'approvePage') {

		if (!$scope.isApprover) {		//redir to non-approval mode
			$stateParams.action = null;
			$stateParams.actionId = null;
			$state.go($state.current, $stateParams);
		}

		$scope.approvePageMode = true;
		$rootScope.guidanceTextId = 'docwiki/guidance/approve/page';

	} else if ($stateParams.action == 'signPage') {

		if (!$scope.isSigner) {			//redir to non-signing mode
			$stateParams.action = null;
			$stateParams.actionId = null;
			$state.go($state.current, $stateParams);
		}

		$scope.signPageMode = true;
		$rootScope.guidanceTextId = 'docwiki/guidance/sign/page';
	}

	//init
	$scope.isNew = isNew;
	$scope.page = { tags : []};
	$scope.utils = isa.utils;
	$scope.toDelete = [];

	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope: $scope,
		$modal : $modal,
		$state : $state,
		$meteor : $meteor,
		docWiki : docWiki
	} );

	//read existing page
	if (!isNew) {

		$scope.page = $scope.$meteorObject(DocwikiPages, $scope.pageId, false);

		var signed = $scope.page.signedBy || [];
		var approved = $scope.page.approvedBy || [];

		//concat and sort approved/ signers list
		_.forEach(signed, function(e) {e.type = 'Signed'; });
		_.forEach(approved, function(e) {e.type = 'Approved'; });

		var concat = signed.concat(approved);

		$scope.approvedSigned = _.sortBy(concat, 'at');

			if ($scope.showChanges) {

				//show the changes between the current version of this page and the previous

				$scope.$meteorSubscribe ('docwikiPageVersions', $scope.page.pageId ).then(
					function(subHandle) {

						//determine the previous version (current - 1)
						$scope.previousVersion = parseInt($scope.page.version - 1, 10);
						
						//get version to compare with
						var diffWith = DocwikiPages.find({
							'pageId': $scope.page.pageId, 
							'version' : $scope.previousVersion 
						});
						
						var diffWith = diffWith.fetch()[0];
						var diffWithContents = diffWith.contents || "";

						var thisContents = $scope.page.contents || "";

						//calculate the diff text, uses the long:htmldiff package
						$scope.diff = htmldiff( diffWithContents, thisContents);
						$scope.noChanges = ($scope.diff.length == thisContents.length);
					
					}
				);

			}

	}

	$scope.delete = function(page) {

		//move page to trash
		DocwikiPages.update( { _id : page._id}, 
			{ $set : { inTrash : true } },
			function(err, res) {
				growl.success("This page has been deleted");
			}
		);

	};

	$scope.restore = function(page) {

		DocwikiPages.update( { _id : page._id}, 
			{ $set : { inTrash : false } },
			function(err, res) {
				growl.success("This page has been restored");
			}
		);

	};

    $scope.signPage = function() {

		MultiTenancy.call( 'signPage', $scope.page._id, function(err, res) {

			switch (res) {
				case 'signed':
					growl.success('You have signed this page'); break;
				case 'already-signed':
					growl.info('You have already signed this page'); break;
				default:
					growl.error('The page could not be signed'); break;
			}
		
			//redir to 'normal mode'
			$stateParams.action = null;
			$stateParams.actionId = null;
			$state.go($state.current, $stateParams);
		});


    };

    $scope.approvePage = function() {

    	var signLink = $state.href('docwiki.list.page', 
					{ pageId : $scope.page._id, action : 'signPage'},
					{inherit: true, absolute: true} );

		MultiTenancy.call( 'approvePage', $scope.page._id, signLink, function(err, res) {

			if (err) {
				growl.error(err);
			}

			switch (res) {
				case 'approved':
					growl.success('You have approved this page'); break;
				case 'already-approved':
					growl.info('You have already approved this page'); break;
				default:
					growl.error('The page could not be approved'); break;
			}
			
			//redir to 'normal mode'
			$stateParams.action = null;
			$stateParams.actionId = null;
			$state.go($state.current, $stateParams);
		});
    };


});
