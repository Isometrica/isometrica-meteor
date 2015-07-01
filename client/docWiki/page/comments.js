var app = angular.module('isa.docwiki.comments', []);

/*
 * Directive for the comments function on a page in the doc wiki
 *
 * @author Mark Leusink
 */

app.directive('isaPageComments', [ 'Identity', 'CommentFactory', '$modal',
	function(Identity, CommentFactory, $modal) {

	return {

		scope : {
			parentId : '@'

		},

		controller: function($scope, $element, $attrs, $transclude) {

			$scope.loading = true;
			$scope.add = false;
			$scope.comment = {};

			$scope.addComment = function() {
				$scope.add = true;
			};
			$scope.cancelComment = function() {
				$scope.comment = {};
				$scope.add = false;
			};

			$scope.saveComment = function() {

				Identity.get().then( function(user) {

					$scope.comment.created = new Date();
					$scope.comment.createdBy = user.name;
					$scope.comment.parentId = $scope.parentId;

					CommentFactory.create($scope.comment).then( function(res) {
						$scope.comments.push( res);
						$scope.add = false;
						$scope.comment = {};
					});
				});

			};

			$scope.deleteComment = function(comment) {

				$modal.open({
					templateUrl: 'components/coreSystem/confirm/confirmModal.html',
					controller : 'ConfirmModalController',
					resolve: {
						title: function() {
							return 'Are you sure you want to remove this comment?';
						},
					},
				}).result.then(function(confirmed) {
					if (confirmed) {
						CommentFactory.delete(comment.id).then( function(res) {
							//comment has been removed remotely, remove it from the UI
							$scope.comments.forEach(function(comm, index, array){
					          if(comm.id === comment.id){
					              $scope.comments.splice(index, 1);
					          }
					        });

						});
					}
				});

			};

		},
		restrict: 'AE',
		templateUrl: 'components/docWiki/page/comments/comments.html',
		link: function($scope, iElm, iAttrs, controller) {

			//load the comments once we have a parent id
			 iAttrs.$observe('parentId', function(value){
                if(value){
                	CommentFactory.all(value).$promise.then( function(res) {
                		$scope.comments = res;
                		$scope.loading = false;
                	});
                }
            });
		}
	};
}]);

/*
 * Factory for (Page) comments
 *
 * @author Mark Leusink
 */
app.factory('CommentFactory', [ '$rootScope', '$injector', function($rootScope, $injector) {
  return $injector.get($rootScope.online ? '_CommentRemote' : '_CommentLocal');
}]);

app.factory('_CommentRemote', ['Comment', function(Comment) {
  return {

  	all : function(parentId) {
  		return Comment.find(
			{ filter: { where: { parentId : parentId } } },
			function(list) { },
			function(errorResponse) {
				console.error(errorResponse);
			}
		);
  	},

  	create: function(comment) {
      return Comment.create(comment).$promise;
    },

    delete: function(id) {
      return Comment.delete( { id : id } ).$promise;
    },

    save: function(comment) {
      var comment = new Comment(comment);
      return comment.$save();
    }

  };

}]);

app.factory('_CommentLocal', ['$lowla', '$lowlaDocument', function($lowla, $lowlaDocument) {
  var comments = $lowla.collection('db', 'Comment');

  return {
		all : function(parentId, scope) {
      		return $lowlaArray(comments.find({parentId: parentId}), scope);
		},

	    findById: function(id, scope) {
	      return $lowlaDocument(comments.find({id: id}), scope);
	    },

	    create: function(comment) {
	      return $lowlaDefer(comments.insert(comment));
	    },

	    delete: function(id) {
	      return $lowlaDefer(comments.remove({id: id}));
	    },

	    save: function(comment) {
	      return $lowlaDefer(comments.findAndModify({ id: comment.id }, comment));
	    }
  }
}]);
