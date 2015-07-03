var app = angular.module('isa.docwiki');

/*
 * Controller to add/edit a page in a document
 */
app.controller('PageEditBaseController',
	[ '$scope', '$modal', '$http', '$state', 'FileUploader',
		function($scope, $modal, $http, $state, FileUploader) {
	//TODO: fix dependencies
	//[ 'Page', 'PageFactory', 'CurrentUser',
	//function(Page, PageFactory, CurrentUser) {

	var isNew = false;

	//setup file uploader object
	var uploader = $scope.uploader = new FileUploader({
		url : '/uploads'
	});

	//edit a page in a modal or open the modal to add a new one
	$scope.editPage = function(page) {

		if (typeof page == 'undefined') {		//adding a new page

			page = {
				documentId : $scope.moduleId,
				isDraft : false
			};

			isNew = true;

		}

		var modalInstance = $scope.modalInstance = $modal.open({
			templateUrl: 'client/docWiki/page/pageEdit.ng.html',
			controller: 'PageEditModalController',
			windowClass : 'docwiki',
			size : 'lg',
			backdrop : true,
			resolve: {
				currentPage : function () {
					return page;
				},
				pageFiles : function() {
					return $scope.pageFiles;
				},
				isNew : function() {
					return isNew;
				},
				uploader : function() {
					return uploader;
				},
				pages : function() {
					return $scope.pages;
				}
			}
		});

		modalInstance.result.then(function (data){
			if (data.reason=='save') {

				//edit modal closed: re-open page
				$state.go('docwiki.page', {pageId : data.pageId });

			}
	    }, function () {

	    });
	};

	/*
	 * used for tags: converts an array of tag objects:
	 * [ { text : 'tag 1'}, { text : 'tag 2'} ]
	 * to an array of strings:
	 * [ 'tag 1', 'tag 2' ]
	 */

	var tagObjectsToStringArray = function(tagsObjArray) {
		var tagsArray = [];

    	angular.forEach( tagsObjArray, function(tag) {
      		tagsArray.push( tag.text);
		});

		return tagsArray;
	};

}]);
