
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
			{ name : "ZetaComm", id : '12345' }
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

		if ($scope.isNew) {

			//set defaults
			$scope.module.isTemplate = false;
			$scope.module.isArchived = false;
			$scope.module.inTrash = false;
			$scope.module.organisation = $scope.selectedOrganisation;

		}

		$modalInstance.close( { action : 'save', context : $scope.module } );
	};

	/**
	 * 'Deletes' the module by setting its 'inTrash' flag to true.
	 */
	$scope.delete = function() {

		$scope.module.inTrash = true;
		$modalInstance.close( { action : 'delete', context : $scope.module });

	};

	/**
	 * 'Restores' the module from the trash
	 */
	$scope.delete = function() {

		$scope.module.inTrash = false;
		$modalInstance.close( { action : 'restore', context : $scope.module });

	};

	/**
	 * Dismisses the module dialog 
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

}]);
