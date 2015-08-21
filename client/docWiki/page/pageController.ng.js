
var app = angular.module('isa.docwiki');

/*
 * Controller for a page in a DocWiki. Includes the code to compare 2 versions of a page.
 *
 * @author Mark Leusink
 */
app.controller('PageController',
	[ '$scope', '$state', '$stateParams', '$meteor', '$modal', '$controller', 'isNew', 'docWiki', 'growl',
		function($scope, $state, $stateParams, $meteor, $modal, $controller, isNew, docWiki, growl) {	

	$scope.showChanges = $state.current.name.indexOf('changes')>-1;

	$scope.moduleId = $stateParams.moduleId;
	$scope.pageId = $stateParams.pageId;
	$scope.pageInfoCollapsed = true;

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

		$scope.$meteorSubscribe("docwikiPages", $scope.moduleId).then( function(subHandle) {

			$scope.page = $scope.$meteorObject(DocwikiPages, $scope.pageId, false);

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

						//calculate the diff text, uses the long:htmldiff package
						$scope.diff = htmldiff( diffWith.contents, $scope.page.contents);
						$scope.noChanges = ($scope.diff.length == $scope.page.contents.length);
					
					}
				);

			}
	
		});

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

    $scope.signDocument = function() {

		$meteor.call( 'signPage', $scope.page._id).then(
			function(data) {
				growl.success('You have successfully signed \'' + $scope.page.section + ' ' + 
					$scope.page.title + '\'');

				//TODO: send a notification here?
			},
			function(err) {
				console.error(err);
				growl.error(err.message);

			}
		);
    };

}]);
