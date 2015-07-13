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
	      template: '<div ui-view></div>',
	      controller: 'IssuesController',
	      abstract: true,
	    })
	    .state('docwiki.issues.list', {
	      url: '',
	      templateUrl: 'client/docWiki/issue/issuesView.ng.html',
	      controller: 'IssuesController'
	    })
	    .state('docwiki.issues.detail', {
	      url: '/:issueId',
	      templateUrl: 'client/docWiki/issue/issueView.ng.html',
	      controller: 'IssueController'
	    });

}]);
