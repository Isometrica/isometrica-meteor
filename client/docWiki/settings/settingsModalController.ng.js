var app = angular.module('isa.docwiki');

app.controller('SettingsModalController', function($modalInstance, growl, docWiki, currentUser) {

	var vm = this;

	vm.docWiki = angular.copy(
		_.omit(docWiki,
			'save', 'reset', '$$collection', '$$options', '$meteorSubscribe', '$$id', '$q', '$$hashkey'));
	
	//only the current user (and the account owner) can delete the wiki
	//TODO: the 'account owner' should be able to delete too
	if ( docWiki.owner._id == currentUser._id ) {
		vm.canDelete = true;
	} else {
		vm.canDelete = false;
	}

	vm.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};

	//saves a new or updated page
	vm.save = function(form) {

		if (!form.$valid) {
			return;
		}

		var ops = form.$getSchemaOps();
    Modules.update( vm.docWiki._id, ops,
			function(err, res) {
				if (err) {
		        	growl.error('Settings could not be saved: ' + err );
		      	} else {
		        	$modalInstance.close({reason: 'save'});
		      	}
		    }
		);

	};

	/**
	 * 'Deletes' the DocWiki by setting its 'inTrash' flag to true.
	 */
	vm.deleteDocWiki = function() {

		docWiki.inTrash = true;
		docWiki.save().then( function() {
			growl.success('Document "' + docWiki.title + '" has been moved to the trash');
			$modalInstance.close();
		});

	};

	/**
	 * 'Restores' a module from the trash
	 */
	vm.restoreDocWiki = function() {

		docWiki.inTrash = false;
		docWiki.save().then( function() {
			growl.success('Document "' + docWiki.title + '" has been restored from the trash');
			$modalInstance.close();
		});

	};

});
