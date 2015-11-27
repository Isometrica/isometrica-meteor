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
		    url : '/{action:.*}/{actionId:.*}',
		    templateUrl: 'client/docWiki/docWiki.ng.html',
		    controller : 'DocWikiController',
		    data : {
		    	anonymous: false
		    },
		    resolve : {
				docWiki : function($meteor, module) {
					return $meteor.object( Modules, module._id, false);
				}
			}
	
		})

		.state('docwiki.list', {
			url: '/list/:listId',
			templateUrl : 'client/docWiki/lists/listView.ng.html',
		    controller : 'DocWikiListController',
		    resolve : {
		    	pagesSub : function($meteor, $stateParams) {
		    		return $meteor.subscribe('docwikiPages', $stateParams.moduleId);
		    	}
		    },
		    onExit : function(pagesSub) {
		    	pagesSub.stop();
		    }
		})

		.state('docwiki.search', {
			url: '/search/:query',
			templateUrl : 'client/docWiki/search/searchResults.ng.html',
		    controller : 'SearchController'
		})
		.state('docwiki.search.page', {
		    url: '/page/:pageId',
		    templateUrl: 'client/docWiki/page/pageRead.ng.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return false; }
		    }
		})

		.state('docwiki.list.page', {
		    url: '/page/:pageId',
		    templateUrl: 'client/docWiki/page/pageRead.ng.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return false; }
		    }
		})

		.state('docwiki.list.page.changes', {
		    url: '/changes',
		    templateUrl: 'client/docWiki/page/pageRead.ng.html',
		    controller : 'PageController'
		})

		.state('docwiki.list.issues', {
	      url: '/issues',
	      templateUrl: 'client/docWiki/issue/issuesView.ng.html',
	      controller: 'IssuesController',
	      resolve : {
		    	issuesSub : function($meteor, $stateParams) {
		    		return $meteor.subscribe('docwikiIssues', $stateParams.moduleId);
		    	}
		    },
		    onExit : function(issuesSub) {
		    	issuesSub.stop();
		    }
	      
	    });

});
