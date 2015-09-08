var app = angular.module('isa.docwiki');

/*
 * Controls adding or editing a page in a modal
 */
app.controller('PageEditModalController',
	[ '$scope', '$rootScope', '$modalInstance', '$state', '$meteor', '$filter', '$modal', '$location', 'pages', 'currentPage', 'isNew', 'docWiki', 'fileHandlerFactory',
		function($scope, $rootScope, $modalInstance, $state, $meteor, $filter, $modal, $location, pages, currentPage, isNew, docWiki, fileHandlerFactory) {

	$scope.isNew = isNew;
	$scope.page = currentPage;

	$scope.utils = isa.utils;

	$scope.collapseExtendedForm = true;

	$scope.isOwner = (docWiki.owner._id == $rootScope.currentUser._id);
	$scope.automaticApprovals = (docWiki.approvalMode == 'automatic' || $scope.isOwner);

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

		//move page to trash
		DocwikiPages.update( { _id : page._id}, 
			{ $set : { inTrash : true } },
			function(err, res) {
				$modalInstance.close({reason:'delete'});
			}
		);

	};

	$scope.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};

	//saves a new or updated page
	$scope.save = function(form) {

		if (!form.$valid) {
			return;
		}

		var pageObject = $scope.page;
		
		pageObject.contents = pageObject.contents.trim();

		if (isNew) {

			//saving a new page
			savePage(pageObject, true, true);

		} else {

			//editing an existing page
			if (pageObject.isDraft) {

				if ($scope.automaticApprovals) {
					//user editing a draft page, while automatic approvals are enabled -> disabled draft and publish
					//(this might be the case if the owner is opening a draft version)
					pageObject.isDraft = false;

					//unmark other pages as 'current version'
					var allVersions = DocwikiPages.find({"pageId": pageObject.pageId, currentVersion : true, _id : { $ne : pageObject._id}} );

					allVersions.forEach( function(_page) {
						console.log('unmarking'  + _page._id);
						DocwikiPages.update( { _id : _page._id}, { $set : { currentVersion : false } });
					});

				}

				//changes in a draft page are saved to the same version - no new notification is send
				savePage(pageObject, false, false);

			} else {

				//changes in a non-draft page: create a new version

				var pageId = pageObject.pageId;

			    //remove the id to create a new page
			    delete pageObject['_id'];

				//determine the new version number (highest number of all versions + 1)
				var v = 1;

				//get all versions of the page
				$scope.$meteorSubscribe ('docwikiPageVersions', pageId ).then(
					function(subHandle) {

						var first = true;

						//get the latest versions of this page (from a sorted collection)
						var allVersions = DocwikiPages.find({"pageId": pageId}, {sort: { version : -1} } );

						allVersions.forEach( function(_page) {

							//the first page in the collection has the highest version, so we'll use that
							if (first) { v = _page.version; first = false; }

							//unmark all existing pages as 'currentVersion'
							//(in manual approval mode we can skip that: both the new (draft) version and the current published
							//version are marked as 'current')
							if ($scope.automaticApprovals) {
								DocwikiPages.update( { _id : _page._id}, { $set : { currentVersion : false } });
							}

						});

						//set the version and save the new/ updated page
						pageObject.version = v+1;
						pageObject.currentVersion = true;

						$scope.submitted = true;

						savePage(pageObject, false, true);

					}
				);
			
			}

		}

	};

	/*
	 * Saves a page to the database, including any attached files
	 *
	 * @author Mark Leusink
	 *
	 * @param pageObject (object)			page fields that are to be saved
	 * @param isNew	(boolean)				indicates if this is a new page or not
	 * @param _sendNotification (boolean)	determines if a notification is send after saving
	 */

	var savePage = function(pageObject, isNew, _sendNotification) {

		//convert tags object array to array of strings
      	pageObject.tags = tagObjectsToStringArray( pageObject.tags);

      	if (!$scope.automaticApprovals) {
			//manual approvals: the saved page is a 'draft'
			pageObject.isDraft = true;
      	}

		pages.save( pageObject )
		.then( function(_saved) {

			var pageId = _saved[0]._id;
			pageObject._id = pageId;
			var currentFiles = (isNew ? null : pageObject.files);

			//handle file uploads/ removals
			fileHandlerFactory.saveFiles(pages, pageId, currentFiles, $scope.selectedFiles)
			.then( function(res) {

				if (_sendNotification) {
					sendNotification(pageObject, isNew);
				}

				$modalInstance.close({reason: 'save', pageId : pageId});

			});
		});

	};

	function sendNotification(pageObject, isNew) {

		var sendToId = docWiki.owner._id;		//send to owner

		//console.log('owner=' + sendToId, ' current is ' + $rootScope.currentUser._id, $scope.isOwner);

		//check if we need to send an email
		var sendEmail = ($rootScope.currentUser._id != sendToId);

		if (!sendEmail) {
			return;
		}

		var currentUserName = $rootScope.currentUser.profile.fullName;
		var pageTitle = $filter('pageTitleFilter')(pageObject);
		var docWikiTitle = docWiki.title;
		
		//get url to the current and 'changes' page
		var pageLink = $state.href('docwiki.list.page', { pageId : pageObject._id}, {inherit: true, absolute: true} );
		var changesLink = $state.href('docwiki.list.page.changes', { pageId : pageObject._id }, {inherit: true, absolute: true} );

		if (isNew) {			//new page created

			//notification: be able to rollback on opening

			subject = "Page added to the docwiki \"" + docWikiTitle + "\"";
			body = "<p>" + currentUserName + " has just added a page titled <b>" + pageTitle + "</b> " +
				"to the docwiki <b>" + docWikiTitle + "</b>.</p>";

			if ($scope.automaticApprovals) {

				body += "<p>The page is automatically published. Click <a href=\"" + pageLink + "\">here</a> to view it.</p>";

			} else {

				body += "<p>The page isn't visible yet. " +
					"Click <a href=\"" + pageLink + "\">here</a> to view the page and approve it for publication.</p>";

			}

		} else {		// page updated

			subject = "Page updated in the docwiki \"" + docWikiTitle + "\"";
			body = "<p>" + currentUserName + " has just updated a page titled <b>" + pageTitle + "</b> " +
				" in the docwiki <b>" + docWikiTitle + "</b>.</p>";

			if ($scope.automaticApprovals) {

				body += "<p>The page is automatically published. Click <a href=\"" + changesLink + "\">here</a> to view the changes.</p>";

			} else {

				body += "<p>The page isn't visible yet. " +
					"Click <a href=\"" + changesLink + "\">here</a> to view the changes and approve the page for publication.</p>";

			}

		}

		MultiTenancy.call("sendToInbox", sendToId, subject, body);

	}

}]);
