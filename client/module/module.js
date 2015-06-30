
var app = angular.module('isa.module', [
	'ui.bootstrap.typeahead'
]);

/**
 * Create a new module or edit an existing module's settings.
 *
 * @todo 	We need to move edit vs new functionality to some form of base class.
 * 			At present there is serious duplication of boilerplate going on in
 * 			different controllers. But then again, isn't that OK if the controllers
 * 			represent separate domains?
 * @author 	Steve Fortune, Mark Leusink
 */
app.controller('ModuleController',
	['$scope', '$modalInstance', 'module',
		function($scope, $modalInstance, module) {

		//TODO link to datasource: function($scope, $modalInstance, OrganisationService, ModuleService, module) {

	/**
	 * @var Boolean
	 */
	$scope.isNew = !module;

	/**
	 * @var Object
	 */
	$scope.selectedOrganisation = $scope.isNew ? null : module.organisation;

	/**
	 * @var Object
	 */
	$scope.module = $scope.isNew ? {} : angular.copy(module);

	/**
	 * @return Promise
	 */
	$scope.findOrganisations = function(name) {

		//TODO search organisations
		/*return OrganisationService.search(name, {
			isTemplate: true
		});*/

		return [
			{ name : "ZetaComm", id : 10 }
		];
	};

	/**
	 * Handlers a service-level err
	 *
	 * @param 	err 	Object | String
	 */
	var handleErr = function(err) {
		// TODO Handle
	};

	/**
	 * Either creates a new module or update an existing if we're editing.
	 */
	$scope.save = function() {
		$modalInstance.close( $scope.module);
	};

	/**
	 * 'Deletes' the module by setting its 'inTrash' flag to true.
	 */
	$scope.delete = function() {
		ModuleService.updateById($scope.module.id, angular.extend({}, $scope.module, {
			inTrash : true
		})).then(function(module) {
			$modalInstance.close();
		}, handleErr);
	};

	/**
	 * Dismisses the module dialog 
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

}]);
