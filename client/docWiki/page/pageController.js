var app = angular.module('isa.docwiki');

/*
 * Controller to add/edit a page in a document
 */
app.controller('PageController',
  [ '$scope', '$state', '$stateParams', '$modal', '$http', '$controller', 'Page', 'PageFactory', 'isNew', 'CurrentUser', 'growl',
	function($scope, $state, $stateParams, $modal, $http, $controller, Page, PageFactory, isNew, CurrentUser, growl) {

	$scope.moduleId = $stateParams.moduleId;
	$scope.pageId = $stateParams.pageId;

	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope: $scope,
		$modal : $modal,
        CurrentUser: CurrentUser
	} );

	var _readRelatedFiles = function(parentId) {
		$http.get('/files/' + parentId).then( function(res) {
			var files = res.data;
			angular.forEach(files, function(file) {
				file.markedForDeletion = false;
				var ext = file.filename.substring( file.filename.lastIndexOf('.') + 1).toLowerCase();
				file.isImage = (ext == 'jpg' || ext=='jpeg' || ext == 'gif' || ext == 'png');
			});
			$scope.pageFiles = files;
		});
	};

	//init
	$scope.isNew = isNew;
	$scope.page = { tags : []};
	$scope.utils = isa.utils;
	$scope.toDelete = [];

	//read existing page
	if (!isNew) {
		$scope.page = PageFactory.findById( $scope.pageId, $scope );
		_readRelatedFiles($scope.pageId);
	}

	$scope.delete = function(page) {

		$modal.open({
			templateUrl: 'components/coreSystem/confirm/confirmModal.html',
			controller : 'ConfirmModalController',
			resolve: {
				title: function() {
					return 'Are you sure you want to remove this page?<br />This action will remove all versions of this page.';
				},
			},
		}).result.then(function(confirmed) {
			if (confirmed) {
				PageFactory.delete( page.id )
				.then( function(deletedPlan) {
					$state.go('docwiki', {}, {reload: true});
				});
			}
		});

	};

    $scope.signDocument = function() {

      Page.sign( {pageId : $scope.page.id , userName: CurrentUser.name}).$promise
        .then(function(res) {
          growl.success('You have successfully signed this page');
          $state.reload();
        }, function(err) {
          alert('An error occurred.\n\n' + err.data.error.message);
        });

    };

	/*
	 * shows a modal to display an image
	 */
	$scope.lightbox = function(file) {

		$modal.open({
	      templateUrl: 'components/lightbox/lightboxModal.html',
			controller : 'LightboxModalController',
			size : 'lg',
			resolve: {
				id: function() {
					return file._id;
				},
				name: function() {
					return file.filename;
				}
			},
	    });

	};

}]);
