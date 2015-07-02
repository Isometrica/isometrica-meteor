var app = angular.module('isa.docwiki');

/*
 * Define states for the Document Wiki module
 *
 * @author Mark Leusink
 */


app.config(['$stateProvider', function($stateProvider){

	$stateProvider

    	.state('docwiki', {
		    url: '/docwiki',
			parent: 'module',
		    templateUrl: 'client/docWiki/docWiki.ng.html',
		    controller : 'DocWikiController',
		    data : {
		    	anonymous: false
		    }
		})

		.state('docwiki.page', {
		    url: '/page/:pageId',
		    templateUrl: 'client/docWiki/page/pageRead.ng.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return false; }
		    }
		})

	    .state('docwiki.issues', {
	      url: '/issues',
	      templateUrl: 'client/docWiki/issue/issuesView.ng.html',
	      controller: 'IssuesController'
	    })

	    .state('docwiki.issue', {
	      url: '/issue/:issueId',
	      templateUrl: 'client/docWiki/issue/issueView.ng.html',
	      controller: 'IssueController'
	    })

}]);
