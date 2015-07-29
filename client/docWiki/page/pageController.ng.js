
var app = angular.module('isa.docwiki');

/*
 * Controller for a page in a DocWiki
 */
app.controller('PageController',
	[ '$scope', '$state', '$stateParams', '$meteor', '$modal', '$http', '$controller', 'isNew', 'growl',
		function($scope, $state, $stateParams, $meteor, $modal, $http, $controller, isNew, growl) {

	$scope.moduleId = $stateParams.moduleId;
	$scope.pageId = $stateParams.pageId;

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
		$meteor : $meteor
	} );

	//read existing page
	if (!isNew) {

		$scope.$meteorSubscribe("docwikiPages", $scope.moduleId).then( function(subHandle) {

			$scope.page = $scope.$meteorObject(DocwikiPages, $scope.pageId, false);
	
		});

	}

	$scope.delete = function(page) {

		$modal.open({
			templateUrl: 'client/confirm/confirm.ng.html',
			controller : 'ConfirmModalController',
			resolve: {
				title: function() {
					return 'Are you sure you want to remove this page?<br />This action will remove all versions of this page.';
				},
			},
		}).result.then(function(confirmed) {
			if (confirmed) {

				$scope.$meteorCollection( DocwikiPages ).remove( page._id )
				.then( function() {
					//redirect to docwiki
					$state.go('docwiki');
				});
			}
		});

	};

    $scope.signDocument = function() {

		$meteor.call( 'signPage', $scope.page._id).then(
			function(data) {
				growl.success('You have successfully signed this page');

				//TODO: send a notification here?
			},
			function(err) {
				console.error(err);
				growl.error(err.message);

			}
		);
    };

}]);
