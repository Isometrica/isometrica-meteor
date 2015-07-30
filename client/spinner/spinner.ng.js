var app = angular.module('isa');

/*
 * Loading indicator (spinner) that will appear after 1 second.
 * Unless the 'loaded' attribute is set to 'true'
 *
 * @author Mark Leusink
 */

app.directive( "isaSpinner", function($timeout) {

	return {
		scope : {
			style : '@',
			notNeeded : '='
		},
		restrict : 'AE',
		replace : true,
		template : '<div ng-show="loading" style="style"><i class="fa fa-spin fa-spinner"></i></div>',
		controller : function($scope) {

			
			//show spinner after a second (but only if the content hasn't loaded yet)
			$timeout( function() {
				if (!$scope.notNeeded) {
					$scope.loading = true;
				}
			}, 1000);
		}


	};

});