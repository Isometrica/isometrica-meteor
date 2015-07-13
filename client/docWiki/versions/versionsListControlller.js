'use strict';

var app = angular.module('isa.docwiki.versions');

/*
 * Controller to roll back to a different page version: page versions are related using a uniqued pageId. Every page
 * version has a currentVersion attribute. The 'current' page has this attribute set to true.
 *
 * @author Mark Leusink
 */
app.controller('VersionsListController',
	[ '$scope', '$state', '$modal', '$meteor', '$modalInstance', 'currentPageId', 'growl',
	function($scope, $state, $modal, $meteor, $modalInstance, currentPageId, growl) {

		$scope.$meteorSubscribe ('docwikiPageVersions', currentPageId ).then(
			function(subHandle) {
				$scope.versions = $meteor.collection(function () {
					return DocwikiPages.find({"pageId": currentPageId}, {sort: { version : -1} });
				});
			}
		);

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

					//rollback to the selection version, close confirm & version select dialogs

					//unmark the previous 'current' version
					$scope.versions.forEach( function(v) {
						if (v.currentVersion) {
							v.currentVersion = false;
						}
					});

					//mark current page as the current version
					page.currentVersion = true;

					$modalInstance.close();
					growl.success('Rolled back to version ' + page.version);
					$state.go('docwiki.page',
						{ pageId : page._id},
						{ reload: true });

				}
			});

		};

		$scope.dismiss = function() {
			$modalInstance.close(false);
		};

}]);
