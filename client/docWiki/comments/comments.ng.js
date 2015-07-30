var app = angular.module('isa.docwiki.comments', [
	'isa.form',
	'isa.filters'
	]);

/*
 * Directive for the comments function on a page in the DocWiki
 *
 * @author Mark Leusink
 */

app.directive('isaPageComments', [ '$modal',
	function($modal) {

	return {

		scope : {
			parentId : '@'
		},

		controller: function($scope, $element, $attrs, $transclude) {

			$scope.add = false;
			$scope.comment = {};

			$scope.addComment = function() {
				$scope.add = true;
			};
			$scope.cancelComment = function() {
				$scope.comment = {};
				$scope.add = false;
			};

			$scope.saveComment = function(form) {
				if (form.$valid) {
					$scope.comment.parentId = $scope.parentId;

					$scope.comments.save( $scope.comment ).then( function(res) {
						$scope.add = false;
						$scope.comment = {};
					});
				}

			};

			$scope.deleteComment = function(comment) {

				$modal.open({
					templateUrl: 'client/confirm/confirm.ng.html',
					controller : 'ConfirmModalController',
					resolve: {
						title: function() {
							return 'Are you sure you want to remove this comment?';
						}
					},
				}).result.then(function(confirmed) {
					if (confirmed) {

						$scope.comments.remove(comment)
							.then( function(res) {
						});
					}
				});

			};

		},
		restrict: 'AE',
		templateUrl: 'client/docWiki/comments/comments.ng.html',
		link: function($scope, iElm, iAttrs, controller) {

			//load the comments once we have a parent id
			 iAttrs.$observe('parentId', function(parentId){
                if(parentId){

					$scope.$meteorSubscribe("docwikiPageComments", parentId).then( function(subHandle) {

						$scope.comments = $scope.$meteorCollection(DocwikiPageComments);
						$scope.loaded = true;

					});
                }
            });
		}
	};
}]);

