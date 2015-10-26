var app = angular.module('isa.docwiki');

app.controller('EmailAsPdfModalController', function($modalInstance, action, currentTitle, helpText){
	
	var vm = this;

	vm.action = action;
	vm.helpText = helpText;

	vm.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	vm.save = function(form) {

		if (!form.$valid) {
			return;
		}

		$modalInstance.close({ reason : 'save', email : vm.email } );

	};

});