var app = angular.module('isa.docwiki');

app.controller('SearchController', 
	function($rootScope, $controller, $scope, $meteor, $stateParams, $state, $modal, docWiki, growl) { 

	$scope.query = $stateParams.query;
	$scope.searchScope = "local";		//or global
	$scope.setTitle("Search results for: " + $scope.query);

	$scope.$meteorSubscribe("moduleNames")

	var resub = function(q) {

		//close the existing subscription to the search results and re-subscribe for a new resultset
		if ($scope.subHandle) { $scope.subHandle.stop(); }
		$scope.$meteorSubscribe("docwikiPagesSearch", q, docWiki._id, ($scope.searchScope=='local'))
		.then( function (subHandle) {

			$scope.subHandle = subHandle;

			$scope.searchResults = $meteor.collection(function() {
				return DocwikiPages.find({});
			} );

		});

	};

	resub($scope.query);

	$scope.toggleSearchScope = function() {
		$scope.searchScope = ( $scope.searchScope == 'local' ? 'global' : 'local');
		resub( $scope.query );
	};

	//get a module's title based on its id
	//used to show the parent document in the search results
	$scope.getModuleTitle = function(id) {
		var module = Modules.findOne( { _id : id});
		return (module ? module.title : '(module not found)');	
	};

	$scope.$watch( 'query', function(q) {

		if (q) {
			resub(q);
		} else if (!q) {
			//query has been emptied: return to the list
			$state.go('docwiki.list', { listId : 'sections'} );
		}

	} );

	/* Find/replace a text in all pages */
	$scope.replaceText = function() {

		if (!$scope.replace) {
			growl.error("Enter the text that should replace '" + $scope.query + "'");
			return;
		}

		$meteor.call( "findAndReplace", $scope.docWiki._id, $scope.query, $scope.replace)
		.then( function(data) {
			growl.success("Replaced '" + $scope.query + "' by '" + $scope.replace + "' in all pages");
			$scope.replace = "";
			$scope.query = "";
		} );

	};

});
