var app = angular.module('isa.overview');

app.controller('ChangeTitleController', function($modalInstance, action, currentTitle, helpText){
	
	var vm = this;

	vm.action = action;
	vm.helpText = helpText;

	vm.settings = {
		title: currentTitle
	};

	vm.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	vm.save = function(form) {

		if (!form.$valid) {
			return;
		}

		$modalInstance.close({ reason : 'save', title : vm.settings.title } );

	};

});