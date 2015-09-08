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
				docWiki : function($meteor, $stateParams) {
					return $meteor.subscribe("module", $stateParams.moduleId).
				   	then( function(subHandle) {
				   		return $meteor.object(Modules, $stateParams.moduleId, false);
				   	} );
				}
			}
		})

		.state('docwiki.list', {
			url: '/list/:listId',
			templateUrl : 'client/docWiki/lists/listView.ng.html',
		    controller : 'DocWikiListController'
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
	      controller: 'IssuesController'
	      
	    });

});
