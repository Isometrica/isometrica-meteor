
var app = angular.module('isa.filehandler');

/**
 * @author Mark Leusink
 */
app.controller('LightboxModalController', [
	'$scope', '$modalInstance', 'id', 'name', 'url',
	function($scope, $modalInstance, id, name, url) {

	$scope.id = id;
	$scope.name = name.substring( 0, name.lastIndexOf('.'));		//name without the extension
	$scope.imgSrc = url;

	$scope.dismiss = function() {
		$modalInstance.close(false);
	};

}]);
