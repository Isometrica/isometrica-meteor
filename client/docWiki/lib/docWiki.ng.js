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
	function($rootScope, $scope, $meteor, $stateParams, $state, $modal, growl, docWiki, currentUser) {

	$scope.moduleId = $stateParams.moduleId;
	$scope.docWiki = docWiki;
	$rootScope.guidanceTextId = 'docwiki/guidance';

	var determineSettings = function() {
		$scope.isOwner = docWiki.owner._id == $rootScope.currentUser._id;

		if ($scope.isOwner) {
			//owners have full access
			$scope.isReader = true;
			$scope.isEditor = true;
			$scope.isApprover = true;
			$scope.isSigner = true;
		} else {

			if (docWiki.allowEditByAll) {
				$scope.isEditor = true;
			} else {
				$scope.isEditor = !_.isUndefined( _.findWhere(docWiki.editors || [], { _id : $rootScope.currentUser._id }) );
			}

			if ($scope.isEditor) {
				//if the current user is an editor, he's also a reader
				$scope.isReader = true;
			} else {

				if ( docWiki.allowReadByAll ) {
					$scope.isReader = true;
				} else {
					$scope.isReader = !_.isUndefined( _.findWhere(docWiki.readers || [], { _id : $rootScope.currentUser._id }) );
				}
			}

			$scope.isApprover = !_.isUndefined( _.findWhere(docWiki.approvers || [], { _id : $rootScope.currentUser._id }) );
		   	$scope.isSigner = !_.isUndefined( _.findWhere(docWiki.signers || [], { _id : $rootScope.currentUser._id }) );
	  	}
	};

	determineSettings();

	if ($stateParams.action=='approve' ||
		( $scope.isOwner && $scope.docWiki.status != 'approved')  ) {
		//show 'approve' button in 'approve' mode and for the owner in a non

		//check if the current user is allowed to approve: redirect if not
		if (!$scope.isApprover) {

			growl.error('You\'re not allowed to approve this document');

			$state.go('docwiki.list', { 
                        moduleId : $scope.docWiki._id, listId : 'sections', 
                        action : '', actionId : ''}, {} );
			return;

		}

		$scope.actionId = $stateParams.actionId;		//possible reference to an issue
		$scope.approvalMode = true;
		$rootScope.guidanceTextId = 'docwiki/guidance/approve';

	}

	if ($stateParams.action=='sign') {

		//check if the current user is allowed to approve: redirect if not
		if (!$scope.isSigner) {

			growl.error('You\'re not allowed to sign this document');

			$state.go('docwiki.list', { 
                        moduleId : $scope.docWiki._id, listId : 'sections', 
                        action : '', actionId : ''}, {} );
			return;

		}

		$scope.actionId = $stateParams.actionId;		//possible reference to an issue
		$scope.signMode = true;
		$rootScope.guidanceTextId = 'docwiki/guidance/sign';

	}


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

	//set a custom title in the header bar of the docwiki
	$scope.setTitle = function(title) {
		$scope.docWikiTitle = title;
	};

	$scope.editSettings = function() {

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/settings/settings.ng.html',
			controller: 'SettingsModalController',
			controllerAs: 'vm',
			windowClass : 'isometrica-wiki',
			backdrop : 'static',
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

		var textId = 'docwiki/guidance/saveAsTemplate';
		var t = SystemTexts.findOne( { textId : textId });
		var helpText = ( t ? t.contents : textId);

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/changeTitle/changeTitle.ng.html',
			controller: 'ChangeTitleModalController',
			controllerAs: 'vm',
			backdrop : 'static',
			resolve: {
				currentTitle : function() {
					return docWiki.title;
				},
				action : function() {
					return 'Save as template';
				},
				helpText : function() {
					return helpText;
				}
			}
		});

		modalInstance.result.then(function (result) {
		    if (result.reason == 'save') {

		    	$scope.docWiki.title = result.title;
		    	$scope.docWiki.isTemplate = true;
				$scope.docWiki.save().then( function() {

					var o = $rootScope.currentOrg.name;
					o += (o.substring(o.length-1) == 's' ? '\'' : '\'s');	//organisation's

					growl.success('Document "' + result.title + '" saved in ' +
						o + ' list of Templates');
				});
		    }
	    });

	};

	//unmarks a document as a template
	/*$scope.unTemplate = function() {

		$scope.docWiki.isTemplate = false;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been unmarked as a template');
		});

	};*/

	//marks a document as 'archived': it will shown only in the 'archived' documents section
	$scope.saveInArchive = function() {

		var textId = 'docwiki/guidance/archive';
		var t = SystemTexts.findOne( { textId : textId });
		var helpText = ( t ? t.contents : textId);

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/changeTitle/changeTitle.ng.html',
			controller: 'ChangeTitleModalController',
			controllerAs: 'vm',
			backdrop : 'static',
			resolve: {
				currentTitle : function() {
					return docWiki.title;
				},
				action : function() {
					return 'Archive document';
				},
				helpText : function() {
					return helpText;
				}
			}
		});

		modalInstance.result.then(function (result) {
		    if (result.reason == 'save') {

		    	$scope.docWiki.isArchived = true;
		    	$scope.docWiki.archivedAt = new Date();
		    	$scope.docWiki.title = result.title;
		    	
				$scope.docWiki.save().then( function() {
					growl.success('Document "' + result.title + '" has been archived');
					$state.go('overview');
				});
		    }
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

		var textId = 'docwiki/guidance/duplicate';
		var t = SystemTexts.findOne( { textId : textId });
		var helpText = ( t ? t.contents : textId);

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/changeTitle/changeTitle.ng.html',
			controller: 'ChangeTitleModalController',
			controllerAs: 'vm',
			backdrop : 'static',
			resolve: {
				currentTitle : function() {
					return docWiki.title;
				},
				action : function() {
					return 'Duplicate document';
				},
				helpText : function() {
					return helpText;
				}
			}
		});

		modalInstance.result.then(function (result) {
		    if (result.reason == 'save') {

		    	MultiTenancy.call("copyDocWiki", $scope.docWiki._id, result.title, false, function(err, res) {
					growl.success('This document has been duplicated as \'' + res.title + '\'');
				} );

		    }
	    });

	};

	//move/ restore a document to the trash
	$scope.removeDoc = function() {
		$scope.docWiki.inTrash = true;
		$scope.docWiki.trashedAt = new Date();
		$scope.docWiki.save().then( function() {

			var o = $rootScope.currentOrg.name;
			o += (o.substring(o.length-1) == 's' ? '\'' : '\'s');	//organisation's

			var msg = ($scope.docWiki.isTemplate ?
				'Document "' + $scope.docWiki.title + '" deleted from ' + o + ' list of Templates' :
				'This document has been moved to the trash');

			growl.success(msg);
			$state.go('overview');
		});

	
	};

	$scope.restoreDoc = function() {
		$scope.docWiki.inTrash = false;
		$scope.docWiki.save().then( function() {
			growl.success('This document has been restored from the trash');
		});
	};

	$scope.approveDocument = function() {

		//retrieve a link to the 'sign' page for this document: we need that in notifications
		var signLink = $state.href('docwiki.list', { 
                        moduleId : $scope.docWiki._id, listId : 'sections', 
                        action : 'sign', actionId : $scope.actionId}, {inherit: true, absolute: true} );

		var openLink = $state.href('docwiki.list', {
		                moduleId : $scope.docWiki._id, listId : 'sections', 
                        action : '', actionId : ''}, {inherit: true, absolute: true} );	

		MultiTenancy.call('approveDocWiki', $scope.docWiki._id, $scope.actionId, signLink, openLink,
			function(err, res) {
			switch (res) {
				case 'approved':
					growl.success('You have approved this document');
					$scope.docWiki.status = 'approved';
					break;
				case 'already-approved':
					growl.info('You have already approved this document'); break;
				default:
					growl.error('The document could not be approved'); break;
			}

			//redir to 'normal mode'
			$state.go('docwiki.list', { 
                moduleId : $scope.docWiki._id, listId : 'sections', 
                action : '', actionId : ''}, {} );


		});
	};

	$scope.signDocument = function() {

		MultiTenancy.call('signDocWiki', $scope.docWiki._id, $scope.actionId, function(err, res) {
			switch (res) {
				case 'signed':
					growl.success('You have signed this document'); break;
				case 'already-signed':
					growl.info('You have already signed this document'); break;
				default:
					growl.error('The document could not be signed'); break;
			}

			//redir to 'normal mode'
			$state.go('docwiki.list', { 
                moduleId : $scope.docWiki._id, listId : 'sections', 
                action : '', actionId : ''}, {} );

		});
	};

	$scope.emailAsPdf = function() {

		//open a modal to ask for an email address, then generate a PDF that will be send to
		//that email address

		var textId = 'docwiki/guidance/email';
		var t = SystemTexts.findOne( { textId : textId });
		var helpText = ( t ? t.contents : textId);

		var modalInstance = $modal.open({
			templateUrl: 'client/docWiki/emailAsPdf/emailAsPdf.ng.html',
			controller : 'EmailAsPdfModalController',
			controllerAs: 'vm',
			backdrop : 'static',
			resolve: {
				currentTitle : function() {
					return docWiki.title;
				},
				action : function() {
					return 'Email as PDF';
				},
				helpText : function() {
					return helpText;
				}
			}
			
		});

		modalInstance.result.then(function (result) {
		    if (result.reason == 'save') {
		    	MultiTenancy.call("emailAsPdf", $scope.docWiki._id, result.email, function(err, res) {
					growl.success('Document has been sent as PDF to ' + result.email);
				} );
		    }
	    });

	};

});

/*
 * Filter to show a title for a page as: section + title
 * where section receives a trailing dot if it isn't there yet.
 * This filter also remove leading zero's
 *
 * @author Mark Leusink
 */

app.filter('pageTitleFilter', function() {

	return function(page) {
		var section = page.section;
		if (section && section.length) {

			if (section.indexOf('.')>-1) {
				var comps = section.split('.');

				for (var i=0; i<comps.length; i++) {
					if ( comps[i].length>0 && !isNaN( comps[i]) ) {
						comps[i] = parseInt(comps[i], 10) + '';
					}
				}

				section = comps.join('.');
			} else if (!isNaN( section) ) {
				section = parseInt(section, 10) + '';
			}

			if (section.substr( section.length-1) != '.') {
					section += '.';		//add trailing .
			}

			section += ' ';
		}
		return section + page.title;
	};

});

app.run(['$rootScope', function($rootScope) {
	var body = angular.element(document.querySelector('body'));
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
	  
	  var docWikiClassess = 'bootcards-wiki isometrica-wiki';
	  if (toState.name.indexOf('docwiki')> -1) {
	    body.addClass(docWikiClassess);
	  } else {
	    body.removeClass(docWikiClassess);
	  }
	});
}]);
