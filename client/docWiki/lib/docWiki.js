var app = angular.module('isa.docwiki', [

	'angular-meteor',

	'ui.router',
	'ui.bootstrap',
	'textAngular',
	'ngTagsInput',
	'ngAnimate',

	'isa.form',
	'isa.filters',
	'isa.docwiki.versions',
	'isa.docwiki.comments',
	'isa.docwiki.reissue',

	'isa.filehandler',

	'angular-growl'

]);

//temporary disable animations on Bootstrap modal because of know issues with Angular 1.4
app.config( ['$modalProvider', function ($modalProvider) {
	$modalProvider.options.animation = false;
}]);

/*
 * Isometrica Document Wiki module
 *
 * @author Mark Leusink
 */
app.controller( 'DocWikiController',
	['$rootScope', '$scope', '$meteor', '$stateParams', '$state', '$controller', '$modal', 'growl',
		function($rootScope, $scope, $meteor, $stateParams, $state, $controller, $modal, growl) {

	$scope.moduleId = $stateParams.moduleId;

   	$meteor.subscribe("modules").
   	then( function(subHandle) {
		
   		$scope.docWiki = $meteor.object(Modules, $stateParams.moduleId, false);
   		_readPages($scope.moduleId);
   		
   	});
   	
	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope : $scope,
		$modal : $modal,
		$state : $state,
		$meteor : $meteor
	} );

	//open the first menu item ('Sections') by default
	$scope.menuOptions = [
		{name : 'By section', isCollapsed : false, id: 'sections', template: 'client/docWiki/lists/by-section.ng.html'},
		{name : 'Recently modified', isCollapsed : true, id: 'recent', template: 'client/docWiki/lists/recent.ng.html'},
		{name : 'Draft sections', isCollapsed : true, id: 'draft', template: 'client/docWiki/lists/drafts.ng.html'},
		{name : 'Tags', isCollapsed : true, id: 'tags', template: 'client/docWiki/lists/tags.ng.html'},
		{name : 'Signed by', isCollapsed : true, id: 'signed', template: 'client/docWiki/lists/signed.ng.html'}
	];

	$scope.editSettings = function() {

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/settings/settings.ng.html',
			controller: 'SettingsModalController',
			controllerAs: 'vm',
			windowClass : 'docwiki',
			backdrop : true,
			resolve: {
				docWiki : function() {
					return $scope.docWiki;
				}
			}
		});

	};

	$scope.hasDrafts = false;

	var _readPages = function(docWikiId) {

		//load pages for this document, order by section ascending
		$scope.$meteorSubscribe("docwikiPages", docWikiId).then( function(subHandle) {

			$scope.pages = $meteor.collection( function(){

				var col = DocwikiPages.find( {currentVersion : true}, {sort : {'section' : 1}} );

		      	//loop through all pages to  get all signers and tags, these are stored in a variable
				//to be referenced in the nav menu
				var signersList = [];

				var tagsList = [];
				var tagsMap = {};

				/*col.forEach( function(page) {

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
*/
				$scope.signersList = signersList;
				$scope.tagsList = tagsList;

				return col;
			});


		});

	};

	/*
	 * Check if we're dealing with a 'main' section (section name without dots in the title) or not
	 *
	 * @author Mark Leusink
	 */
	$scope.isMainCat = function(page) {
		var s = page.section;
		return ( !s || s.length === 0 || s.indexOf('.')===-1 ? true : false );
	};

	//saves a document as a template
	$scope.saveAsTemplate = function() {

		$scope.docWiki.isTemplate = true;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been marked as a template');
		});

	};

	//unmarks a document as a template
	$scope.unTemplate = function() {

		$scope.docWiki.isTemplate = false;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been unmarked as a template');
		});

	};

	//marks a document as 'archived': it will shown only in the 'archived' documents section
	$scope.saveInArchive = function() {

		$scope.docWiki.isArchived = true;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been archived');
			$state.go('overview');
		});
	};

	//un-marks a document as being archived
	$scope.unArchive = function() {

		$scope.docWiki.isArchived = false;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been unarchived');
		});
	};

	//duplicates a document
	$scope.duplicateDoc = function() {

		$meteor.call( "copyDocWiki", $scope.docWiki._id ).then( function(data) {
			growl.success('This document has been duplicated as \'' + data.title + '\'');
		} );

	};

	//move/ restore a document to the trash
	$scope.removeDoc = function() {
		$scope.docWiki.inTrash = true;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been moved to the trash');
			$state.go('overview');
		});
	};

	$scope.restoreDoc = function() {
		$scope.docWiki.inTrash = false;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been restored from the trash');
		});
	};

	$scope.toggleGroup = function(section) {

		var doOpen = section.isCollapsed;

		if (doOpen) {
			//open this, hide others
			angular.forEach( $scope.menuOptions, function(o) {
				o.isCollapsed = (o.name == section.name ? false : true );
			});

		} else {
			//close this only
			section.isCollapsed=true;

		}

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

				//get pages by tag, or all
				$scope.$meteorSubscribe("docwikiPages", $stateParams.moduleId).then( function(subHandle) {

					subCat.pages = $meteor.collection( function(){

						subCat.isCollapsed = false;
						subCat.isLoading = false;

						if (subCat.type === 'signer') {

							return DocwikiPages.find(
								{
									'currentVersion' : true,
									'signatures.createdBy' : subCat.name
								},
								{sort : {'section' : 1}} );

						} else {

							return DocwikiPages.find(
								{
									currentVersion : true,
									tags : subCat.name
								},
								{sort : {'section' : 1}} );

						}
					});

				});

			}

		} else {

			subCat.isCollapsed = true;

		}

	};

}]);
