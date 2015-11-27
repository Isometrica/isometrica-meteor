var app = angular.module('isa.docwiki');

app.controller('SearchController', 
	function($rootScope, $controller, $scope, $meteor, $stateParams, $state, $modal, $timeout, docWiki, growl) { 

	$scope.query = $stateParams.query;
	$scope.searchScope = "local";		//or global
	$scope.setTitle("Search");

	$scope.$meteorSubscribe("moduleNames");

	var resub = function() {

		var q = $scope.query;

		//close the existing subscription to the search results and re-subscribe for a new resultset
		if ($scope.subHandle) { $scope.subHandle.stop(); }
		$scope.searchResults = [];

		if (q) {		//ony subscribe if we actually have a query
			$scope.$meteorSubscribe("docwikiPagesSearch", q, docWiki._id, ($scope.searchScope=='local'))
			.then( function (subHandle) {

				$scope.subHandle = subHandle;

				$scope.searchResults = $meteor.collection(function() {

					var col = DocwikiPages.find({});

					$scope.tagsList = [];
					var tagsMap = {};

					col.forEach( function(d) {

					 	var docId = d.documentId;

					 	if ( !tagsMap[docId] ) {
					 		var docName = Modules.findOne({ _id : docId}).title;
							tagsMap[docId] = docName;
							$scope.tagsList.push( {name: docName, id : docId, isCollapsed : true} );
						}
					});

					return col;

				} );

			});
		}

	};

	resub();

	$scope.toggleSearchScope = function() {
		$scope.searchScope = ( $scope.searchScope == 'local' ? 'global' : 'local');
		resub( );
	};

	//opens/ closes a sub-category in the navigation menu
	$scope.toggleSubCategory = function(subCat) {

		//open tags (and optionally load content)
		if (subCat.isCollapsed) {

			if (subCat.pages) {
				subCat.isCollapsed = false;
			} else {

				//get pages by tag, or all
				subCat.pages = $meteor.collection( function(){

					subCat.isCollapsed = false;

					return DocwikiPages.find(
						{
							currentVersion : true,
							documentId : subCat.id
						},
						{sort : {'section' : 1}} );
				});

			}

		} else {

			subCat.isCollapsed = true;

		}

	};

	$scope.doSearch = function(ev) {
		//perform query on enter
		if (ev.which===13) {
			resub();
		}
	};

	$scope.backToDocument = function() {
		$state.go('docwiki.list', { listId : 'sections'}, {reload: true} );
	};

	//remove all html from a text and return the first 50 chars
	$scope.getContentsSnippet = function(html) {

		if (!html || html.length==0) { return ""; }

		var div = document.createElement("div");
		div.innerHTML = html;
		var text = div.textContent || div.innerText || "";

		return text.substring(0, 75) + "...";
		
	};

	/* Find/replace a text in all pages */
	$scope.replaceText = function() {

		if (!$scope.replace) {
			growl.error("Enter the text that should replace '" + $scope.query + "'");
			return;
		}

		$meteor.call( "findAndReplace", $scope.docWiki._id, $scope.query, $scope.replace)
		.then( function(data) {
			growl.success("Replaced '" + $scope.query + "' by '" + $scope.replace + "' in all pages");
			resub();

		} );

	};

});
