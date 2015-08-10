var app = angular.module('isa.docwiki');

app.controller('DocWikiListController', ['$controller', '$scope', '$meteor', '$stateParams', '$state', '$modal', 'docWiki', 
	function($controller, $scope, $meteor, $stateParams, $state, $modal, docWiki) { 

	var listId = $stateParams.listId;

	$scope.list = _.findWhere( $scope.menuOptions, { id : listId} );
	$scope.setActiveList($scope.list);

	$scope.hasDrafts = false;

	//instantiate base controller (used to edit pages in a modal)
	$controller('PageEditBaseController', {
		$scope : $scope,
		$modal : $modal,
		$state : $state,
		$meteor : $meteor,
		docWiki : docWiki
	} );

	var _readPages = function(docWikiId) {

		//load pages for this document, order by section ascending
		$scope.$meteorSubscribe("docwikiPages", docWikiId).then( function(subHandle) {

			$scope.pages = $meteor.collection( function(){

				//loop through all pages to  get all signers and tags, these are stored in a variable
				//to be referenced in the nav menu
				var signersList = [];

				var tagsList = [];
				var tagsMap = {};
				
				var docsBySection = [];

				var col= DocwikiPages.find( {currentVersion : true}, {sort : {'section' : 1}} );

				//loop through all pages and group them by 'main' documents
				//(pages with a section no that has just 1 digiti in it)
				col.forEach( function(page) {

					var level = 1;
					var section = page.section;
					var sectionNo;

					if ( page.isDraft) {
						$scope.hasDrafts = true;
					}

					if (section && section.length && section.indexOf('.')) {
						sectionComps = section.split('.');
						level = sectionComps.length;
						sectionNo = sectionComps[0];
					}

					if (level == 1) {
						page.children = [];
						page.sectionNo = sectionNo;
						page.isCollapsed = true;
						docsBySection.push(page);

					} else {

						if (docsBySection.length>0 && docsBySection[docsBySection.length-1].sectionNo == sectionNo) {
							docsBySection[docsBySection.length-1].children.push(page);
						} else {
							docsBySection.push(page);
						}

					}

					//process all signatures
					angular.forEach(page.signatures, function(sig) {
						if ( !signersList[sig.name] ) {
							signersList[sig.name] = sig.name;
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

				});

				$scope.signersList = signersList;
				$scope.tagsList = tagsList;
				$scope.docsBySection = docsBySection;

				return col;

			});


		});	//meteor subscribe

	};	//_readPages

	_readPages($scope.moduleId);

	//show/ hide the children of the selected page and navigate to the page
	$scope.toggleSectionCat = function(page) {
		page.isCollapsed = !page.isCollapsed;
		$state.go('docwiki.list.page', { pageId : page._id });
	};

	$scope.isSubsection = function(page) {
		var s = page.section;
		return ( s && s.length > 0 && s.indexOf('.')>-1 && s.split('.').length>2);
	};

	//opens/ closes a sub-category in the navigation menu
	$scope.toggleSubCategory = function(subCat) {

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
