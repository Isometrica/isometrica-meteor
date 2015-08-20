var app = angular.module('isa.docwiki');

/*
 * Controls adding or editing a page in a modal
 */
app.controller('PageEditModalController',
	[ '$scope', '$rootScope', '$modalInstance', '$meteor', '$modal', 'pages', 'currentPage', 'isNew', 'docWiki', 'fileHandlerFactory',
		function($scope, $rootScope, $modalInstance, $meteor, $modal, pages, currentPage, isNew, docWiki, fileHandlerFactory) {

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

		if (!form.$valid) {
			return;
		}

		var pageObject = $scope.page;
		var automaticApprovals = (docWiki.approvalMode == 'automatic');

		pageObject.contents = pageObject.contents.trim();

		if (isNew) {

			//saving a new page
			savePage(pageObject, true);

		} else {

			//editing an existing page: save as a new version (= new page object)
			var pageId = pageObject.pageId;

			if (pageObject.isDraft) {

				//changes in a draft page are saved in the same version
				savePage(pageObject, false);

			} else {

				//changes in a non-draft page: create a new version

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
							if (automaticApprovals) {
								DocwikiPages.update( { _id : _page._id}, { $set : { currentVersion : false } });
							}

						});

						//set the version and save the new/ updated page
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

		var automaticApprovals = (docWiki.approvalMode == 'automatic');

 	 	//convert tags object array to array of strings
      	pageObject.tags = tagObjectsToStringArray( pageObject.tags);

      	if (!automaticApprovals) {
			//manual approvals: the saved page is a 'draft'
			pageObject.isDraft = true;
      	}

		pages.save( pageObject )
		.then( function(_saved) {

			var pageId = _saved[0]._id;
			var currentFiles = (isNew ? null : pageObject.files);

			//handle file uploads/ removals
			fileHandlerFactory.saveFiles(pages, pageId, currentFiles, $scope.selectedFiles)
			.then( function(res) {

				sendNotification(pageObject, automaticApprovals);
				$modalInstance.close({reason: 'save', pageId : pageId});

			});
		});

	};

	function sendNotification(pageObject, automaticApprovals) {

		var sendToId = docWiki.owner._id;		//send to owner

		//check if we need to send an email
		var sendEmail = ($rootScope.currentUser._id != sendToId);

		if (!sendEmail) {
		//	return;
		}

		var currentUserName = $rootScope.currentUser.profile.fullName;
		var pageTitle = pageObject.section + ' ' + pageObject.title;
		var docWikiTitle = docWiki.title;
		var pageLink = "http://server/url";		//TODO

		if (isNew) {			//new page created

			//notification: be able to rollback on opening

			subject = "Page added to the docwiki \"" + docWikiTitle + "\"";
			body = "<p>" + currentUserName + " has just added a page titled <b>" + pageTitle + "</b> " +
				"to the docwiki <b>" + docWikiTitle + "</b>.</p>";

			if (automaticApprovals) {

				body += "<p>The page is automatically published. Click <a href=\"" + pageLink + "\">here</a> to view it.</p>";

			} else {

				body += "<p>The page isn't visible yet. " +
					"Click <a href=\"" + pageLink + "\">here</a> to view the page for publication and approve it for publication.</p>";

			}

		} else {		// page updated

			subject = "Page updated in the docwiki \"" + docWikiTitle + "\"";
			body = "<p>" + currentUserName + " has just updated a page titled <b>" + pageTitle + "</b> " +
				" in the docwiki <b>" + docWikiTitle + "</b>.</p>";

			if (automaticApprovals) {

				body += "<p>The page is automatically published. Click <a href=\"" + pageLink + "\">here</a> to view it.</p>";

			} else {

				body += "<p>The page isn't visible yet. " +
					"Click <a href=\"" + pageLink + "\">here</a> to view the page for publication and approve it for publication.</p>";

			}

		}

		MultiTenancy.call("sendToInbox", sendToId, subject, body);

	}

}]);
