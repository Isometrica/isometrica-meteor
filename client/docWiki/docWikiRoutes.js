var app = angular.module('isa.docwiki');

/*
 * Define states for the Document Wiki module
 *
 * @author Mark Leusink
 */
app.config(['$stateProvider', function($stateProvider){

	$stateProvider

    	.state('docwiki', {
		    url: '/docwiki/:planId',
			parent: 'module',
		    templateUrl: 'components/docWiki/docWikiView.html',
		    controller : 'DocWikiController',
		    data : {
		    	anonymous: false
		    }
		})

		.state('docwiki.newpage', {
		    url: '/page/new',
		    templateUrl: 'components/docWiki/page/pageEdit.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return true; }
		    }
		})

		.state('docwiki.page', {
		    url: '/page/:pageId',
		    templateUrl: 'components/docWiki/page/pageRead.html',
		    controller : 'PageController',
		    resolve : {
		    	isNew : function() { return false; }
		    }
		})

	    .state('docwiki.issues', {
	      url: '/issues',
	      templateUrl: 'components/docWiki/issue/issuesView.html',
	      controller: 'IssuesController'
	    })

	    .state('docwiki.issue', {
	      url: '/issue/:issueId',
	      templateUrl: 'components/docWiki/issue/issueView.html',
	      controller: 'IssueController',
	      resolve : {

	    }

	});

}]);
