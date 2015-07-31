var app = angular.module('isa.docwiki');

app.controller('SettingsModalController', function($modalInstance, docWiki) {

	var vm = this;

	vm.docWiki = angular.copy(
		_.omit(docWiki, 
			'save', 'reset', '$$collection', '$$options', '$meteorSubscribe', '$$id', '$q', '$$hashkey'));
	
	vm.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};

	//saves a new or updated page
	vm.save = function(form) {

		if (!form.$valid) {
			return;
		}

		Modules.update( vm.docWiki._id, form.$getSchemaOps(),
			function(err, res) {
				if (err) {
		        	growl.error('Settings could not be saved: ' + err );
		      	} else {
		        	$modalInstance.close({reason: 'save'});
		      	}
		    }
		);

	};

});