
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
	['$scope', '$modalInstance', '$meteor', 'growl', 'modules', 'module',
		function($scope, $modalInstance, $meteor, growl, modules, module) {

	/**
	 * @var Boolean
	 */
	$scope.isNew = !module;

	/**
	 * @var Object
	 */
	$scope.module = $scope.isNew ? {} : angular.copy(module);

	/**
	 * Either creates a new module or update an existing if we're editing.
	 */
	$scope.save = function() {

		if ($scope.isNew) {

			//add a new module by calling a remote method
			//TODO: create new modules only from a smart template

			MultiTenancy.call("createModule", $scope.module, function(err, res) {

				$scope.module.type = 'docwiki';		//only supported option at this time

				if (err) {
					growl.error(err);
					return;
				}

				growl.success('The module has been added');
				$modalInstance.close();

			});

		} else {

			//save the new/ updated module
			modules.save($scope.module)
			.then( function() {
				growl.success('Module settings have been updated');
				$modalInstance.close();
			});
			
		}

	};

	/**
	 * Dismisses the module dialog
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

}]);
