var app = angular.module('isa.docwiki');

/*
 * Controls adding or editing a page in a modal
 */
app.controller('PageEditModalController',
	[ '$scope', '$modalInstance', '$meteor', '$modal', 'pages', 'currentPage', 'isNew', 'fileHandlerFactory',
		function($scope, $modalInstance, $meteor, $modal, pages, currentPage, isNew, fileHandlerFactory) {

	$scope.isNew = isNew;
	$scope.page = currentPage;

	$scope.utils = isa.utils;

	/*
	 * used for tags: converts an array of tag strings:
	 * [ 'tag 1', 'tag 2' ]
	 * to an array of objects:
	 * [ { text : 'tag 1'}, { text : 'tag 2'} ]
	 *
	 * @author Mark Leusink
	 */
	var tagStringToObjectsArray = function(tagsArray) {

		var tagsObjectArray = [];

		if (typeof tagsArray != 'undefined') {
			tagsArray.forEach( function(tag) {
				tagsObjectArray.push( { "text" : tag.text} );
			});
		}

		return tagsArray;
	};

	/*
	 * used for tags: converts an array of tag objects:
	 * [ { text : 'tag 1'}, { text : 'tag 2'} ]
	 * to an array of strings:
	 * [ 'tag 1', 'tag 2' ]
	 *
	 * @author Mark Leusink
	 */
	var tagObjectsToStringArray = function(tagsObjArray) {
		var tagsArray = [];

	    angular.forEach( tagsObjArray, function(tag) {
	      tagsArray.push( tag.text);
			});

		return tagsArray;

	};

	$scope.page.tags = tagStringToObjectsArray($scope.page.tags);

	//get tag options (all tags in use on all pages in this DocWiki)
	$scope.tagOptions = [];

	MultiTenancy.call("getTagOptions", currentPage.documentId, function(err, res) {
		$scope.tagOptions = res;
	});

	//search through all available tags (all wiki pages)
	$scope.loadTags = function(q) {
		var res = [];
		angular.forEach( $scope.tagOptions, function(tag) {
			if (tag.toLowerCase().indexOf(q)>-1) {
				res.push(tag);
			}
		});
		return res;
	};

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
					$modalInstance.close({reason:'delete'});
				});
			}
		});

	};

	$scope.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};

	//saves a new or updated page
	$scope.save = function(form) {

		if (form.$valid) {

			var pageObject = $scope.page;

			pageObject.contents = pageObject.contents.trim();

			if (isNew) {

				//saving a new page
				savePage(pageObject, true);

			} else {

				//editing an existing page: save as a new version (= new page object)
				var pageId = pageObject.pageId;

			    //remove the id to create a new page
			    delete pageObject['_id'];

				//get the new version number (highest number of all versions + 1)
				var v = 1;

				$scope.$meteorSubscribe ('docwikiPageVersions', pageId ).then(
					function(subHandle) {

						var first = true;

						//get all versions for this page, sorted descending by version no
						var allVersions = DocwikiPages.find({"pageId": pageId}, {sort: { version : -1} } );

						allVersions.forEach( function(_page) {

							//the first page in the collection has the highest version, so we'll use that
							if (first) { v = _page.version; first = false; }

							//unmark all existing pages as 'currentVersion'
							DocwikiPages.update( { _id : _page._id}, { $set : { currentVersion : false } });

						});

						//now save the new/ updated page as a new version
						pageObject.version = v+1;
						pageObject.currentVersion = true;

						$scope.submitted = true;

						savePage(pageObject, false);

					}
				);

			}


		}
	};

	var savePage = function(pageObject, isNew) {

 	 	//convert tags object array to array of strings
      	pageObject.tags = tagObjectsToStringArray( pageObject.tags);

		pages.save( pageObject )
		.then( function(_saved) {
			var pageId = _saved[0]._id;
			var currentFiles = (isNew ? null : pageObject.files);

			//handle file uploads/ removals
			fileHandlerFactory.saveFiles(pages, pageId, currentFiles, $scope.selectedFiles)
			.then( function(res) {
				$modalInstance.close({reason: 'save', pageId : pageId});
			});
		});

	};

}]);
