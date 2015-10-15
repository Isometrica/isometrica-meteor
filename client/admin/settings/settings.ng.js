var app = angular.module('isa.admin');

/*
 * Manage global applications settings
 */
app.controller('SettingsCtrl', function($scope, growl) {

	var vm = this;

	vm.editable = false;

	var settingsId = Settings.findOne()._id;
	vm.settings = $scope.$meteorObject(Settings, settingsId, false);

	vm.save = function() {

		vm.settings.save()
		.then( function() {
			growl.success('Settings have been saved');
			vm.editable = false;
		}, function(err) {
			growl.error('An error occurred while saving the settings: ' + err);

		});

	};

});
