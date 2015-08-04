var app = angular.module('isa.docwiki');

app.controller('DocWikiListController', ['$controller', '$scope', '$meteor', '$stateParams', '$state', '$modal',
	function($controller, $scope, $meteor, $stateParams, $state, $modal) { 

	var listId = $stateParams.listId;

	$scope.list = _.findWhere( $scope.menuOptions, { id : listId} );
	$scope.setActiveList($scope.list);

	$scope.hasDrafts = false;

	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope : $scope,
		$modal : $modal,
		$state : $state,
		$meteor : $meteor
	} );

	var _readPages = function(docWikiId) {

		console.log('read pages');

		//load pages for this document, order by section ascending
		$scope.$meteorSubscribe("docwikiPages", docWikiId).then( function(subHandle) {

			var p = false;

			$scope.pages = $meteor.collection( function(){

				var col = DocwikiPages.find( {currentVersion : true}, {sort : {'section' : 1}} );

				console.log('found', col.count() );

				if (!p) {

					console.log('get signers');

			      	//loop through all pages to  get all signers and tags, these are stored in a variable
					//to be referenced in the nav menu
					var signersList = [];

					var tagsList = [];
					var tagsMap = {};

	console.log('all');
					p = true;

					col.forEach( function(page) {



						if ( page.isDraft) {
							$scope.hasDrafts = true;
						}

						//process all signatures
						angular.forEach(page.signatures, function(sig) {
							if ( !signersList[sig.at] ) {
								signersList[sig.at] = sig.at;
								signersList.push( {name: sig.name, id : sig._id, isCollapsed: true, pages : null, type : 'signer'} );
							}
						});

						//process all tags
						angular.forEach(page.tags, function(tag) {
							if ( !tagsMap[tag] ) {
								tagsMap[tag] = tag;
								tagsList.push( {name: tag, id : tag, isCollapsed: true, pages : null, type : 'tag'} );
							}
						});
					} );

					$scope.signersList = signersList;
					$scope.tagsList = tagsList;
				}

				return col;
			});


		});

	};

	_readPages($scope.moduleId);

	/*
	 * Check if we're dealing with a 'main' section (section name without dots in the title) or not
	 *
	 * @author Mark Leusink
	 */
	$scope.isMainCat = function(page) {
		var s = page.section;
		return ( !s || s.length === 0 || s.indexOf('.')===-1 ? true : false );
	};

	$scope.toggleGroup = function(section) {

		var doOpen = section.isCollapsed;

		if (doOpen) {
			//open this, hide others
			angular.forEach( $scope.menuOptions, function(o) {
				o.isCollapsed = (o.name == section.name ? false : true );
			});

		} else {
			//close this only
			section.isCollapsed=true;

		}

	};

	//opens/ closes a sub-category in the navigation menu
	$scope.toggleSubCategory = function(subCat) {

		var _otherCats = (subCat.type === 'tag' ? $scope.tagsList : $scope.signersList);

		//open tags (and optionally load content)
		if (subCat.isCollapsed) {

			if (subCat.pages) {
				subCat.isCollapsed = false;
			} else {

				subCat.isLoading = true;

				//get pages by tag, or all
				$scope.$meteorSubscribe("docwikiPages", $stateParams.moduleId).then( function(subHandle) {

					subCat.pages = $meteor.collection( function(){

						subCat.isCollapsed = false;
						subCat.isLoading = false;

						if (subCat.type === 'signer') {

							return DocwikiPages.find(
								{
									'currentVersion' : true,
									'signatures._id' : subCat.id
								},
								{sort : {'section' : 1}} );

						} else {

							return DocwikiPages.find(
								{
									currentVersion : true,
									tags : subCat.id
								},
								{sort : {'section' : 1}} );

						}
					});

				});

			}

		} else {

			subCat.isCollapsed = true;

		}

	};

}]);
