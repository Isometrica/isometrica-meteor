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

/*
 * Isometrica Document Wiki module
 *
 * @author Mark Leusink
 */
app.controller( 'DocWikiController',
	['$rootScope', '$scope', '$meteor', '$stateParams', '$state', '$modal', 'growl', 'docWiki', 'currentUser',
		function($rootScope, $scope, $meteor, $stateParams, $state, $modal, growl, docWiki, currentUser) {

	$scope.moduleId = $stateParams.moduleId;
	$scope.docWiki = docWiki;

	var determineSettings = function() {
		$scope.isOwner = docWiki.owner._id == $rootScope.currentUser._id;

		if ($scope.isOwner) {
			$scope.isReader = true;
			$scope.isEditor = true;
			$scope.isApprover = true;
			$scope.isSigner = true;
		} else {

			if ( docWiki.allowReadByAll ) {
				$scope.isReader = true;
			} else {
				$scope.isReader = !_.isUndefined( _.findWhere(docWiki.readers || [], { _id : $rootScope.currentUser._id }) );
			}

			if (docWiki.allowEditByAll) {
				$scope.isEditor = true;
			} else {
				$scope.isEditor = !_.isUndefined( _.findWhere(docWiki.editors || [], { _id : $rootScope.currentUser._id }) );
			}

			$scope.isApprover = !_.isUndefined( _.findWhere(docWiki.approvers || [], { _id : $rootScope.currentUser._id }) );
		   	$scope.isSigner = !_.isUndefined( _.findWhere(docWiki.signers || [], { _id : $rootScope.currentUser._id }) );
	  	}
	};

	determineSettings();

	//open the first menu item ('Sections') by default
	$scope.menuOptions = [
		{name : 'By section', id: 'sections', template: 'client/docWiki/lists/by-section.ng.html'},
		{name : 'Recently modified', id: 'recent', template: 'client/docWiki/lists/recent.ng.html'},
		{name : 'By Tags', id: 'tags', template: 'client/docWiki/lists/tags.ng.html'},
		{name : 'Deleted pages', id: 'deleted', template: 'client/docWiki/lists/deleted.ng.html'}
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
					return docWiki;
				},
				isOwner : function() {
					return $scope.isOwner;
				},
				currentUser : function() {
					return currentUser;
				}
			}
		});

		modalInstance.result.then(function (result) {
		    if (result.reason == 'save') {
		    	//need to call this here to update the scope vars, $autorun might be a better solution for that...
		    	determineSettings();
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

/*
 * Filter to show a title for a page as: section + title
 * where section receives a trailing dot if it isn't there yet.
 *
 * @author Mark Leusink
 */

app.filter('pageTitleFilter', function() {

	return function(page) {
		var section = page.section;
		if (section && section.length && section.indexOf('.')) {
			if (section.indexOf('.') != section.length-1) {
				section += '.';		//add trailing .
			}

			section += ' ';
		}
		return section + page.title;
	};

});

