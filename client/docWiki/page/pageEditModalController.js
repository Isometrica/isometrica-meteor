var app = angular.module('isa.docwiki');

/*
 * Controls adding or editing a page in a modal
 */
app.controller('PageEditModalController',
	[ '$rootScope', '$scope', '$modalInstance', '$http', 'pages', 'currentPage', 'isNew', 'uploader', 'pageFiles',
		function($rootScope, $scope, $modalInstance, $http, pages, currentPage, isNew, uploader, pageFiles) {

	//TODO
	//[  'Plan', '', 'PageFactory', 'Page',
	//function( Plan, , PageFactory, Page,) {

			console.log('modal controller', currentPage);

	$scope.uploader = uploader;
	$scope.isNew = isNew;
	$scope.page = currentPage;
	$scope.pageFiles = pageFiles;

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

	//load tags list for autocomplete
			//TODO
	//Module.tags( { 'documentId' : currentPage.documentId}  ).$promise.then( function(res) {
	//	$scope.tags = res.tags;
	//});

	//creates a list of autocomplete options for tags
	$scope.loadTags = function(q) {
		var res = [];
		angular.forEach( $scope.tags, function(tag) {
			if (tag.toLowerCase().indexOf(q)>-1) {
				res.push(tag);
			}
		});
		return res;
	};

	$scope.delete = function() {
		$modalInstance.close({reason:'delete', item: $scope.selectedItem} );
	};

	$scope.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};


	//saves a new or updated page
	$scope.save = function(form) {

		//validate the input
		if (!form.$valid) {

	  		var msgs = [];

	  		msgs.push("Please correct the following errors:\n");

	  		if (form.$error.required) {
	  			msgs.push("- fill in all required fields\n");
	  		}

	  		if (form.$error.email) {
				msgs.push("- enter a valid email address\n");
	  		}

	  		//TODO: create a proper dialog for this
	  		alert(msgs.join(''));
	  		return;

	  	}

	  	//save the page
	  	savePage($scope.page, $scope.pageFiles);

	};

	//mark an attached file to be deleted when this page is saved
	$scope.deleteFile = function(file) {
		file.markedForDeletion = true;
	};

	var savePage = function(pageObject, pageFiles) {

		//TODO: read current user's name from $rootScope.currentUser
    	//pageObject.createdBy = CurrentUser.getCurrentUser().name;
    	//pageObject.updatedBy = CurrentUser.getCurrentUser().name;

		if (isNew) {

			//saving a new page

     	 	//convert tags object array to array of strings
	      	pageObject.tags = tagObjectsToStringArray( pageObject.tags);

			pages.save( pageObject)
			.then( function(p) {
				_processFileUploads(p._id, pageFiles);
			});

		} else {

			//editing an existing page: save as a new version (= new page object)
			var pageId = pageObject.pageId;

		    pageObject.previousVersionId = pageObject.id;

		    //remove the id to create a new page
		    delete pageObject['id'];

			//create a new version number (highest number of all versions + 1)
			//TODO: move to factory
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
				console.info('saving...');

				PageFactory.create(pageObject)
				.then( function(p) {

					console.info('error???');

						_processFileUploads(p.id, pageFiles);
				});

			});

		}

	};

	/*
    Called after saving a document to the data store.
    Deletes files that are marked for deletion and uploads files from the queue
     */
	var _processFileUploads = function(pageId, pageFiles) {

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
				$modalInstance.close({reason: 'save', pageId : pageId});
	            
	        };
			uploader.uploadAll();

		} else {

			$modalInstance.close({reason: 'save', pageId : pageId});
			
		}

	};

}]);
