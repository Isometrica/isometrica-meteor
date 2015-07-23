var app = angular.module('isa.filehandler', [

	'angular-meteor',
	'ngFileUpload',
	'ui.bootstrap'
	
]);

/*
 * directive to show a 'file picker' to select multiple files
 * the files are queued for upload and need to be processed
 * in the calling controller: you can use fileUploadFactory to do that
 */
app.directive('isaFileUpload', function() {

	return {

		scope: {
			model : '='
		},
		restrict : 'AE',
		templateUrl : 'client/fileHandler/fileUpload.ng.html',

		controller: function($scope) {

			$scope.utils = isa.utils;

			$scope.removeSelected = function(idx) {
				$scope.model.splice(idx, 1);
			};

		}

	};

});
