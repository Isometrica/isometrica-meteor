'use strict';

var app = angular.module('isa.docwiki.versions');

/*
 * Controller to rollback to a different page version
 *
 * @author Mark Leusink
 */
app.controller('VersionsListController',
	[ '$scope', '$state', '$modal', '$meteor', '$modalInstance', 'currentPageId', 'growl',
	function($scope, $state, $modal, $meteor, $modalInstance, currentPageId, growl) {

		console.log('get versions for pageId', currentPageId);

		$scope.$meteorSubscribe("docwikiPageVersions", currentPageId).then( function(subHandle) {

			$scope.versions = $meteor.collection(DocwikiPages);
		});

		/*
		 * rollback to the selected version
		 */
		$scope.rollback = function(page) {

			$modal.open({
				templateUrl: 'client/confirm/confirm.ng.html',
				controller : 'ConfirmModalController',
				resolve: {
					title: function() {
						return 'Are you sure you want to rollback to version ' + page.version + '?';
					}
				}
			}).result.then(function(confirmed) {
				if (confirmed) {

					//TODO: implement
					//rollback to the selection version, close both dialogs
					/*Page.rollback( {pageId : page.id } ).$promise.then( function(err, inst) {*/

					$modalInstance.close();
					growl.success('Rolled back to version ' + page.version);
					$state.go('docwiki.page',
						{ pageId : page.id},
						{ reload: true });

				}
			});



		};

		$scope.dismiss = function() {
			$modalInstance.close(false);
		};

}]);
