var app = angular.module('isa.docwiki.versions', [

	'lbServices',
	'angular-growl'

]);

/*
 * Version management for DocumentWiki pages
 *
 * @author Mark Leusink
 */

app.directive('isaDocwikiPageVersions',
	['$state', 'Page', '$modal', 'growl',
	function($state, Page, $modal, growl){

		return {

			restrict: 'A',
      link : function($scope, elem) {

        elem.bind('click', function () {

          var modalInstance = $modal.open({
            templateUrl: 'components/docWiki/page/versions/listVersions.html',
            controller: 'VersionsListController',
            windowClass : 'docwiki',
            resolve: {
              currentPageId : function () {
                return $scope.page.pageId;
              }
            }
          });

          modalInstance.result.then(function (data) {
            /*if (data.reason == 'save') {
             savePage(data.page, data.pageFiles);
             } else if (data.reason == 'delete') {
             console.log('delete')
             //$scope.deleteItem(data.item);
             }*/
          }, function () {

          });

        });
      }

		};


}]);
