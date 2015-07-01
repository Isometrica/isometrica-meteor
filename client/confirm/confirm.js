
var app = angular.module('isa');

/**
 * @author Steve Fortune
 */
app.controller('ConfirmModalController', [
	'$scope', '$modal', '$modalInstance', 'title',
	function($scope, $modal, $modalInstance, title) {

	/**
	 * @var string
	 */
	$scope.title = title || 'Are you sure you want to do this?';

	/**
	 * @private
	 */
	$scope.confirm = function() {
		$modalInstance.close(true);
	};


	/**
	 * @private
	 */
	$scope.dismiss = function() {
		$modalInstance.close(false);
	};

}]);
