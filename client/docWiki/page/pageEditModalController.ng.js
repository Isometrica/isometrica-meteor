var app = angular.module('isa.docwiki');

/*
 * Controls adding or editing a page in a modal
 */
app.controller('PageEditModalController',
	[ '$scope', '$rootScope', '$modalInstance', '$state', '$meteor', '$filter', '$modal', '$location', 'growl', 'pages', 'currentPage', 'isNew', 'docWiki', 'fileHandlerFactory',
		function($scope, $rootScope, $modalInstance, $state, $meteor, $filter, $modal, $location, growl, pages, currentPage, isNew, docWiki, fileHandlerFactory) {

	$scope.isNew = isNew;
	$scope.page = currentPage;
	$scope.pageInfoCollapsed = true;

	if (!$scope.page.hasOwnProperty('isoClauses') ) {
		$scope.page.isoClauses = [];
	}

	$scope.getNumIsoClauses = function() {
	    return new Array(4);   
	};

	function getDocRefTypeaheadOptions() {

		//Create a list of all document titles used in ISO clause references in
		//all pages of this docwiki. Used for the 'document reference' autocomplete
		var otherPages = DocwikiPages.find( 
			{ documentId : docWiki._id, currentVersion: true, 
				inTrash : false, isoClauses : {$exists : true, $not: {$size: 0}} }, 
			{ fields: { 'isoClauses' : 1 } } );

		var docRefs = [];

		otherPages.forEach( function(page) {
			angular.forEach( page.isoClauses, function(c) {
				docRefs.push( c.documentRef);
			});

		});

		return docRefs.makeArrayUnique();
	}

	$scope.docRefsTypeahead = getDocRefTypeaheadOptions();

	//filter section no: remove leading 00's
	var s = $scope.page.section;
	if (s && s.length ) {
		
		if (s.indexOf('.')>-1) {
			var comps = s.split('.');

			for (var i=0; i<comps.length; i++) {
				if ( comps[i].length > 0 && !isNaN( comps[i]) ) {
					comps[i] = parseInt(comps[i], 10) + '';
				}
			}

			$scope.page.section = comps.join('.');
		} else {
			$scope.page.section = parseInt(s, 10) + '';
		}

	}


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
		pageObject.contents = pageObject.contents.trim();		//trim the editor contents

		if ($scope.isNew) {

			//saving a new page
			savePage(pageObject, true, true, false);

		} else {

			//editing an existing page

			if (pageObject.isDraft) {
				//editing a draft: don't send the notification again

				var unmarkOthers = false;

				if ($scope.automaticApprovals) {
					//user editing a draft page while automatic approvals are enabled -> disable draft and publish
					//(this might be the case if the owner is opening a draft version)
					pageObject.isDraft = false;
					unmarkOthers = true;
				}

				//changes in a draft page are saved to the same version - no new notification is send
				savePage(pageObject, false, false, unmarkOthers);

			} else {

				//changes in a non-draft page: create a new version

			    delete pageObject['_id'];		//remove the id to create a new page
			    pageObject.currentVersion = true;

			    var documentId = pageObject.documentId;
				var pageId = pageObject.pageId;

			    //determine the new version number to be used for this page(highest number of all versions + 1)
				$scope.$meteorSubscribe ('docwikiPageVersions', documentId, pageId ).then(
					function(subHandle) {

						//get the latest (saved) version of this page (from a sorted collection)
						var latestVersion = DocwikiPages.findOne({"documentId" : documentId, "pageId": pageId}, {sort: { version : -1} } ).version;
						var newVersion = latestVersion+1;

						//set the version and save the new/ updated page
						pageObject.version = newVersion;

						savePage(pageObject, false, true, true);

					}
				);

			}

		}

	};

	/*
	 * Remove 'empty' objects (all properties have a zero length) from an array of objects.
	 * Needed so SimpleSchema doesn't throw an error if a user tries to clear an array.
	 */
	var clearEmptyClauses = function(_in) {
		var _out = [];

		_.each(_in, function(c) {
			var isEmpty = true;
			for (var i in c) {
				if (c[i].length>0) {
					isEmpty = false;
				}
			}
			if (!isEmpty) { _out.push(c); }
		});

		return _out;
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

	var savePage = function(pageObject, isNew, _sendNotification, unmarkOthers) {

		//convert tags object array to array of strings
      	pageObject.tags = tagObjectsToStringArray( pageObject.tags);
      	pageObject.isoClauses = clearEmptyClauses(pageObject.isoClauses);

      	if (!$scope.automaticApprovals) {
			//manual approvals: the saved page will be a 'draft'
			pageObject.isDraft = true;

			//in manual approval mode we never unmark other documents: both the new (draft) version and the current published
			//version are marked as 'current'
			unmarkOthers = false;
      	} 

		pages.save( pageObject )
		.then( function(_saved) {

			var newPageId = _saved[0]._id;

			//new page saved: unmark all other versions as 'currentVersion'
			if (unmarkOthers) {
				unmarkOtherVersions(newPageId, pageObject.documentId, pageObject.pageId);
			}

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
		}, function(err) {
			growl.error('The page could not be saved:<div style=\"margin-top:10px\">' + err + '</div>');
		});

	};

	var unmarkOtherVersions = function(newPageId, documentId, pageId) {

		$scope.$meteorSubscribe ('docwikiPageVersions', documentId, pageId ).then(
			function(subHandle) {

			var allVersions = DocwikiPages.find({
				"documentId" : documentId, 
				"pageId": pageId, 
				currentVersion : true,
				_id : { $ne : newPageId }
			} );

			allVersions.forEach( function(_page) {
				DocwikiPages.update( { _id : _page._id}, { $set : { currentVersion : false } });
			});

		});

	};

	function sendNotification(pageObject, isNew) {

		var textId = '';
		var sendToIds = [];

		var textVars = {
			title : docWiki.title,
			pageTitle : $filter('pageTitleFilter')(pageObject),
			currentUser : $rootScope.currentUser.profile.fullName
		};

		if ($scope.automaticApprovals) {
			
			//automatic page approval mode: notify the owner that a page was added/ updated

			//if the current user IS the owner, we can skip this
			if ( $rootScope.currentUser._id == docWiki.owner._id) { return; }

			if (isNew) {
				//direct link to this page
				textVars.pageLink = $state.href('docwiki.list.page', 
					{ pageId : pageObject._id},
					{inherit: true, absolute: true} );
			} else {
				//link to changes
				textVars.pageLink = $state.href('docwiki.list.page.changes', 
					{ pageId : pageObject._id },
					{inherit: true, absolute: true} );
			}
			

			textId = (isNew ? 'docwiki/email/page/added/published' : 'docwiki/email/page/updated/published');
			sendToIds = [docWiki.owner._id];

		} else {

			//manual page approval mode: send notification to all approvers (including the owner)

			if (isNew) {
				//direct link to this page
				textVars.pageLink = $state.href('docwiki.list.page', 
					{ pageId : pageObject._id, action : 'approvePage'},
					{inherit: true, absolute: true} );
			} else {
				//link to changes
				textVars.pageLink = $state.href('docwiki.list.page.changes', 
					{ pageId : pageObject._id, action : 'approvePage' },
					{inherit: true, absolute: true} );
			}

			textId = (isNew ? 'docwiki/email/page/added/forapproval' : 'docwiki/email/page/updated/forapproval');
			sendToIds = _.map( docWiki.approvers, function(m){ return m._id;} );
			sendToIds.push( docWiki.owner._id );

		}

		MultiTenancy.call("sendToInboxById", textId, sendToIds, textVars);

	}

}]);
