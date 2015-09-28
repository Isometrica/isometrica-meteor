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
			parentId : '@',
			moduleId : '@',
			allowEdit : '@',
			allowDelete : '@'
		},

		controller: function($scope, $element, $attrs, $transclude) {

      		$scope.$meteorSubscribe('profileImages');

			$scope.add = false;
			$scope.comment = {};

			$scope.addComment = function() {
				$scope.add = true;
			};
			$scope.cancelComment = function() {
				$scope.add = false;
			};
			$scope.editComment = function(comment) {
				$scope.comment = angular.copy( comment );
				$scope.add = true;
			};

			$scope.saveComment = function(form) {

				var that = $scope;

				if (form.$valid) {
					$scope.comment.parentId = $scope.parentId;
					$scope.comment.moduleId = $scope.moduleId;

					var callback = function(err, res) {
						if (err) {
							console.error(err);
						} else {
							that.add = false;
							that.comment = {};
						}
					};

					if ($scope.comment._id) {
						DocwikiPageComments.update($scope.comment._id,
							{ $set: { text : $scope.comment.text} },
							 callback );
					} else {
						DocwikiPageComments.insert($scope.comment, callback );
					}
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

						$scope.comments.remove(comment._id)
							.then( function(res) {
								//comment has been removed

						}, function(err) {
							console.error(err);
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

						$scope.comments = $scope.$meteorCollection(isa.utils.findAll(DocwikiPageComments));
						$scope.loaded = true;

					});
                }
            });
		}
	};
}]);
