
var app = angular.module('isa.filehandler');

/*
 * Directive to show a link to an attached file,
 * optionally including a 'mark for deletion' button
 */
app.directive('isaFileLink', function($modal, $meteor) {

	return {

		scope : {
			file : '=',
			allowRemove : '@'
		},
		restrict : 'AE',
		templateUrl : 'client/fileHandler/fileLink.ng.html',

		link: function(scope, el, attr) {

			//converts allowRemove to a boolean
			attr.$observe('allowRemove', function() {
		      scope.allowRemove = scope.$eval(attr.allowRemove);
		      if (scope.allowRemove === undefined) {
		        delete scope.allowRemove;
		      }
		    });

			//get the files' url
			
			//TODO: can't we subscribe to this once for all files in the doc and use that here?
			scope.$meteorSubscribe("files").then(function(subscriptionHandle){
		        var f = IsaFiles.findOne( scope.file._id);
				scope.url = (f ? f.url({brokenIsFine : true}) : null);
			});

			//get files' icon class (based on the file extension)
			scope.iconClass = isa.utils.getIconClassForFile(scope.file.name);

			//mark an attached file to be deleted when this page is saved
			scope.deleteFile = function() {
				scope.file.markedForDeletion = true;
			};

			//show a lightbox for images
			scope.showLightbox = function() {

				$modal.open({
			      templateUrl: 'client/fileHandler/lightboxModal.ng.html',
					controller : 'LightboxModalController',
					size : 'lg',
					resolve: {
						id: function() {
							return scope.file._id;
						},
						name: function() {
							return scope.file.name;
						},
						url : function() {
							return scope.url;
						}
					}
			    });

			};

		}
	};

});