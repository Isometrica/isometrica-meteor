var app = angular.module('isa.docwiki');

/*
 * Controller to add/edit a page in a document
 */
app.controller('PageEditBaseController',
	[ '$scope', '$modal', '$http', '$state',
		function($scope, $modal, $http, $state) {
	//TODO: fix dependencies
	//[ '$scope', '$modal', '$http', '$state', 'Page', 'PageFactory', '', 'CurrentUser',
	//function($scope, $modal, $http, $state, Page, PageFactory, FileUploader, CurrentUser) {

	var isNew = false;

	//setup file uploader object
			//TODO
	/*var uploader = $scope.uploader = new FileUploader({
		url : '/uploads'
	});*/

	//edit a page in a modal or open the modal to add a new one
	$scope.editPage = function(page) {

		if (typeof page == 'undefined') {		//adding a new page

			page = {
				documentId : $scope.moduleId,
				isDraft : false
			};
			isNew = true;
		} else {

			//editing an existing page: create a copy to be able to 'cancel' the edit action
			page = angular.copy(page);

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
					return null;
					//TODO
					//return uploader;
				}
			}
		});


		modalInstance.result.then(function (data){
			if (data.reason=='save') {
				//edit modal closed: re-open page
				$state.go('docwiki.page', {pageId: data.pageId }, {reload: true});

			}
	    }, function () {

	    });
	};

	var savePage = function(pageObject, pageFiles) {

    	pageObject.createdBy = CurrentUser.name;
    	pageObject.updatedBy = CurrentUser.name;

		if (isNew) {

			//adding a page: just save it

      		//convert tags object array to array of strings
      		pageObject.tags = tagObjectsToStringArray( pageObject.tags);

			PageFactory.create(pageObject)
			.then( function(p) {

				//set pageId for the first version to the ID of the page
				if ( !p.hasOwnProperty('pageId')) {

					PageFactory.update(p.id, { pageId : p.id })
					.then( function(p) {
						_postSave(p.id, pageFiles);
					});

				}

			});

		} else {

			//editing an existing page: save as a new version (= new page object)
			var pageId = pageObject.pageId;

      pageObject.previousVersionId = pageObject.id;

      delete pageObject['id'];

			//create a new version number (highest number of all versions + 1)
			Page.find( {
					filter:
					{ where : { 'pageId' : pageId }}
				}).$promise.then( function(res) {

          var v = 1;

          angular.forEach( res, function(page) {
					  v = Math.max(v, page.version);

					  //unmark all existing pages as 'currentVersion'
            PageFactory.update(page.id, { currentVersion : false });
				  });

          pageObject.version = v+1;
				  pageObject.currentVersion = true;

				  $scope.submitted = true;

          //convert tags object array to array of strings
          pageObject.tags = tagObjectsToStringArray( pageObject.tags);

          //save the edited page
          PageFactory.create(pageObject)
          .then( function(p) {
            _postSave(p.id, pageFiles);
          });

			});

		}

	};

    /*
    Called after saving a document to the data store.
    Deletes files that are marked for deletion and uploads files from the queue
     */
	var _postSave = function(pageId, pageFiles) {

		//delete selected files
		angular.forEach( pageFiles, function(file) {
			if (file.markedForDeletion) {
				console.info('delete file', file);
				$http.delete('/file/' + file._id);
			}
		});

		//upload all files
		if (uploader.queue.length>0 ) {
			//files attached: upload all

			uploader.onBeforeUploadItem = function(item) {
			    item.url = '/upload/' + pageId;
			};
			uploader.onCompleteAll = function() {
	            $state.go('docwiki.page', {pageId: pageId }, {reload: true});
	        };
			uploader.uploadAll();

		} else {

			_readRelatedFiles(pageId);
			$state.go('docwiki.page', {pageId: pageId }, {reload: true});
		}

	};

	/*
	 * Retrieve a list of files from the GridFS for a specific parent ID
	 */
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
