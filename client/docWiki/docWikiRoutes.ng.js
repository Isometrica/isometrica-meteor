var app = angular.module('isa.docwiki');

/*
 * Define states for the Document Wiki module
 *
 * @author Mark Leusink
 */

app.config(
	function($stateProvider){

	$stateProvider

    	.state('docwiki', {
    		abstract: true,
		    parent: 'module',
		    templateUrl: 'client/docWiki/docWiki.ng.html',
		    controller : 'DocWikiController',
		    data : {
		    	anonymous: false
		    },
		    resolve : {
				docWiki : function($meteor, $stateParams) {
					return $meteor.subscribe("modules").
				   	then( function(subHandle) {
				   		return $meteor.object(Modules, $stateParams.moduleId, false);
				   	} );
				}
			}
		})

		.state('docwiki.list', {
			url: '/list/:listId',
			templateUrl : 'client/docWiki/lists/listView.ng.html',
		    controller : 'DocWikiListController',
		    resolve : {
		    	docWiki : function(docWiki) { return docWiki; }
		    }
		})

		.state('docwiki.list.page', {
		    url: '/page/:pageId',
		    templateUrl: 'client/docWiki/page/pageRead.ng.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return false; },
		    	docWiki : function(docWiki) { return docWiki; }
		    }
		})

		.state('docwiki.issues', {
	      url: '/issues',
	      templateUrl: 'client/docWiki/issue/issuesView.ng.html',
	      controller: 'IssuesController'
	      
	    })
	    .state('docwiki.issues.detail', {
	      url: '/:issueId',
	      templateUrl: 'client/docWiki/issue/issueView.ng.html',
	      controller: 'IssueController'
	    });


});
