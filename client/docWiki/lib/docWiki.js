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
	['$rootScope', '$scope', '$meteor', '$stateParams', '$state', '$modal', 'growl', 'docWiki',
		function($rootScope, $scope, $meteor, $stateParams, $state, $modal, growl, docWiki) {

	$scope.moduleId = $stateParams.moduleId;
	$scope.docWiki = docWiki;

	//open the first menu item ('Sections') by default
	$scope.menuOptions = [
		{name : 'By section', isCollapsed : false, id: 'sections', template: 'client/docWiki/lists/by-section.ng.html'},
		{name : 'Recently modified', isCollapsed : true, id: 'recent', template: 'client/docWiki/lists/recent.ng.html'},
		{name : 'Draft sections', isCollapsed : true, id: 'draft', template: 'client/docWiki/lists/drafts.ng.html'},
		{name : 'Tags', isCollapsed : true, id: 'tags', template: 'client/docWiki/lists/tags.ng.html'},
		{name : 'Signed by', isCollapsed : true, id: 'signed', template: 'client/docWiki/lists/signed.ng.html'}
	];

	$scope.setActiveList = function(list) {
		$scope.list = list;
	};

	$scope.editSettings = function() {

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/settings/settings.ng.html',
			controller: 'SettingsModalController',
			controllerAs: 'vm',
			windowClass : 'isometrica-wiki',
			backdrop : true,
			resolve: {
				docWiki : function() {
					return $scope.docWiki;
				}
			}
		});

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

	

}]);

