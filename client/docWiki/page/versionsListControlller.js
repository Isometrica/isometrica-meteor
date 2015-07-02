var app = angular.module('isa.docwiki');

/*
 * Controller to add/edit a page in a document
 */
app.controller('VersionsListController', [ '$scope', '$state', '$modal', '$modalInstance', 'Page', 'currentPageId', 'growl',
	function($scope, $state, $modal, $modalInstance, Page, currentPageId, growl) {

		$scope.versions = Page.find( {
			filter: 
			{ where : { 'pageId' : currentPageId }}
		});

		/*
		 * rollback to the selected version
		 */
		$scope.rollback = function(page) {

			$modal.open({
				templateUrl: '/components/coreSystem/confirm/confirmModal.html',
				controller : 'ConfirmModalController',
				resolve: {
					title: function() {
						return 'Are you sure you want to rollback to version ' + page.version + '?';
					},
				},
			}).result.then(function(confirmed) {
				if (confirmed) {
					
					//rollback to the selection version, close both dialogs
					Page.rollback( {pageId : page.id } ).$promise.then( function(err, inst) {

						$modalInstance.close();
						growl.success('Rolled back to version ' + page.version);
						$state.go('docwiki.page', { pageId : page.id}, { reload: true });

					});
					

				}
			});



		};

		$scope.dismiss = function() {
			$modalInstance.close(false);
		};

}]);
