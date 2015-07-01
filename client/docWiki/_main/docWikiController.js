var app = angular.module('isa.docwiki', [

	'ui.router'

]);

//TODO: update dependencies. disabled:
/*
 'isa.docwiki.factories',
 'isa.docwiki.versions',
 'isa.docwiki.comments',
 'isa.docwiki.reissue',



 'textAngular',
 'ngAnimate',
 'ngTouch',
 'angularFileUpload',
 'ngTagsInput'
 */

/*
 * Isometrica Document Wiki module
 *
 * @author Mark Leusink
 */
app.controller( 'DocWikiController',
	['$rootScope', '$scope', '$stateParams', '$state', '$controller', '$modal', '$meteor', 'module',
		function($rootScope, $scope, $stateParams, $state, $controller, $modal, $meteor, module) {

			//TODO: check dependencies
	//['Module', 'ModuleService', 'PageFactory', '', 'IssueFactory', 'CurrentUser', 'growl',
	//Module, ModuleService, PageFactory, , IssueFactory, CurrentUser, growl) {

	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope : $scope,
		$modal : $modal
	} );

	$scope.moduleId = module.id;
	$scope.docWiki = module;

	//open the first menu item ('Sections') by default
	$scope.page = { open : true };

	$scope.hasDrafts = false;

	//array to hold the loaded pages
	$scope.pages = [];

	//load all pages for this docwiki, order by section ascending
		//TODO: Load data
	/*PageFactory.all($scope.moduleId).$promise.then( function(pages) {
		_updatePages(pages);
	});*/

    var _updatePages = function(pages) {

      	//loop through all pages to  get all signers and tags, these are stored in a variable
		//to be referenced in the nav menu
		var signersMap = {};
		var signersList = [];

		var tagsList = [];
		var tagsMap = {};

		angular.forEach( pages, function(page) {

			if ( page.isDraft) {
				$scope.hasDrafts = true;
			}
			
			//process all signatures
			angular.forEach(page.signatures, function(sig) {
				if ( !signersList[sig.createdBy] ) {
					signersList[sig.createdBy] = sig.createdBy;
					signersList.push( {name: sig.createdBy, isCollapsed: true, pages : null, type : 'signer'} );
				}
			});

			//process all tags
			angular.forEach(page.tags, function(tag) {
				if ( !tagsMap[tag] ) {
					tagsMap[tag] = tag;
					tagsList.push( {name: tag, isCollapsed: true, pages : null, type : 'tag'} );
				}
			});
		} );

		$scope.signersList = signersList;
		$scope.tagsList = tagsList;
		$scope.pages = pages;
      	$scope.issues = IssueFactory.all($scope.moduleId);

    };

	var _readPages = function() {
		//load pages for this document, order by section ascending
		$scope.pages = $meteor.collection(Pages);
		//PageFactory.all(module.id, $scope);
	};

	//opens/ closes a sub-category in the navigation menu
	$scope.toggleSubCategory = function(subCat) {

		var _otherCats = (subCat.type === 'tag' ? $scope.tagsList : $scope.signersList);

		//close other tags (if opened)
		angular.forEach( _otherCats, function(t) {
			if ( subCat.name !== t.name) { t.isCollapsed = true; }
		});

		//open tags (and optionally load content)
		if (subCat.isCollapsed) {

			if (subCat.pages) {
				subCat.isCollapsed = false;
			} else {

				subCat.isLoading = true;

				var factory = (subCat.type === 'tag' ? PageFactory.byTag : PageFactory.all);

				factory($scope.moduleId, subCat.name).$promise.then( function(pages) {

					subCat.isCollapsed = false;
					subCat.isLoading = false;

					if (subCat.type === 'signer') {
						//filter pages by signer name

						var filteredPages = [];
						angular.forEach( pages, function(page) {
							angular.forEach( page.signatures, function(sig) {
								if (sig.createdBy === subCat.name) {
									filteredPages.push(page);
								}
							});
						});

						subCat.pages = filteredPages;
					} else {
						subCat.pages = pages;
					}

				});

			}

		} else {
			subCat.isCollapsed = true;

		}

	};

	_readPages();

	/*
	 * Get the amount of pixels that a section needs to indent,
	 * based on the number of dots in the section number
	 *
	 * @author Mark Leusink
	 */
	$scope.getIndentation = function(page) {

		var s = page.section;

		if ( !s || s.length === 0 || s.indexOf('.')===-1) { return null;}

		if ( s.substring(s.length-1) === '.' ) {		//remove trailing dot
			s = s.substring(0, s.length -1);
		}

		var indent = (s.split('.').length - 1 );
		if (indent === 0 ) { return null; }

		return { 'font-size' : '14px', 'padding-left': (15 + indent * 10) + 'px'};
	};

	//saves a document as a template
	$scope.saveAsTemplate = function() {
		Module.prototype$updateAttributes({ id: module.id }, {isTemplate : true})
		.$promise.then(function(res) {
			$scope.docWiki.isTemplate = true;
			growl.success('This document has been marked as a template');
		});
	};

	//marks a document as 'archived': it will shown only in the 'archived' documents section
	$scope.saveInArchive = function() {
		Module.prototype$updateAttributes({ id: module.id }, {isArchived : true})
		.$promise.then(function(res) {
			$scope.docWiki.isArchived = true;
			growl.success('This document has been archived');
			$state.go('overview');
		});
	};

	//un-marks a document as being archived
	$scope.unArchive = function() {
		Module.prototype$updateAttributes({ id: module.id }, {isArchived : false})
		.$promise.then(function(res) {
			$scope.docWiki.isArchived = false;
			growl.success('This document has been unarchived');
		});
	};

	//duplicates a document
	$scope.duplicateDoc = function() {

		Module.copy( {planId : module.id }).$promise
		.then(function(res) {
			growl.success('This document has been duplicated as \'' + res.title + '\'');
		});

	};

	//move/ restore a document to the trash
	$scope.removeDoc = function() {
		Module.prototype$updateAttributes({ id: module.id }, {inTrash : true})
		.$promise.then(function(res) {
			$scope.docWiki.inTrash = true;
			growl.success('This document has been moved to the trash');
			$state.go('overview');
		});
	};
	$scope.restoreDoc = function() {
		Module.prototype$updateAttributes({ id: module.id }, {inTrash : false})
		.$promise.then(function(res) {
			$scope.docWiki.inTrash = false;
			growl.success('This document has been restored from the trash');
		});
	};

}]);

/**
 * Angular filter to show a date/time in a 'time ago' like syntax (e.g. 5 seconds ago, an hour ago)
 * Uses Moment.js for formatting
 *
 * @author Mark Leusink
 */
app.filter('timeAgo', function() {
    return function(dateString) {
        return moment(dateString).fromNow();
    };
});

app.filter('list', function() {
    return function(list) {
    	return (list ? list.join(", ") : "");
    };
});
