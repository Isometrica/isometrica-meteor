var app = angular.module('isa.docwiki');

/*
 * Controller to add/edit a page in a document
 */
app.controller('PageEditBaseController',
	[ '$scope', '$modal', '$state', '$meteor', 'docWiki', 'growl',
		function($scope, $modal, $state, $meteor, docWiki, growl) {

	var isNew = false;

	//edit a page or add a new one in a modal
	$scope.editPage = function(pageId) {

		var page = {
			documentId : $scope.moduleId,
			isDraft : false
		};

		if (typeof pageId == 'undefined') {		//adding a new page

			isNew = true;

		} else {

			//get the selected page
			page = DocwikiPages.findOne( { _id : pageId});

		}

		var modalInstance = $scope.modalInstance = $modal.open({
			templateUrl: 'client/docWiki/page/pageEdit.ng.html',
			controller: 'PageEditModalController',
			windowClass : 'isometrica-wiki',
			size : 'lg',
			backdrop : 'static',
			resolve: {
				currentPage : function () {
					return page;
				},
				isNew : function() {
					return isNew;
				},
				pages : function() {
					return $scope.pages;
				},
				docWiki : function() {
					return docWiki;
				}
			}
		});

		modalInstance.result.then(function (data){

			if (data.reason=='save') {

				//edit modal closed: re-open page
				$state.go('docwiki.list.page', {pageId : data.pageId });

			} else if (data.reason == 'delete') {
				//deleted
				growl.success("This page has been deleted");

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
