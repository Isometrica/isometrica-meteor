var app = angular.module('isa.docwiki');

app.controller('SettingsModalController', 
	function($rootScope, $state, $modalInstance, growl, docWiki, currentUser, isOwner) {

	var vm = this;

	vm.isOwner = isOwner;
	vm.currentOwner = docWiki.owner._id;

	vm.apprCollapsed = true;
	vm.editorsCollapsed = true;
	vm.docOwnersCollapsed = true;

	vm.hideExpressions = {
		"editors" : "model.allowEditByAll",
		"readers" : "model.allowReadByAll"
	};

	//only the current user (and the account owner) can delete the wiki
	//TODO: the 'account owner' should be able to delete too
	vm.canDelete = vm.isOwner;

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

		var ops = form.$getSchemaOps();

		if (!ops) { 
			$modalInstance.close({reason: 'close'});
			return;
		}

		Modules.update( vm.docWiki._id, ops,
			function(err, res) {
				if (err) {
		        	growl.error('Settings could not be saved: ' + err );
		      	} else {

		      		//owner has changed: send a notification to the new owner
		      		var newOwner = vm.docWiki.owner._id;

		      		if (vm.currentOwner !== newOwner) {	

		      			var currentUserName = $rootScope.currentUser.profile.fullName;
		      			var pageLink = $state.href('docwiki.list', { moduleId : vm.docWiki._id, listId : 'sections'}, {inherit: true, absolute: true} );

						//create notification for new owner
						MultiTenancy.call("sendToInboxById", "docwiki/email/newowner", newOwner,
							{
								title : vm.docWiki.title,
								currentUser : currentUserName,
								pageLink : pageLink
							});

						growl.success('Document settings have been saved. The new document owner has been notified.');

		      		} else {

		      			growl.success('Document settings have been saved');
		      		}

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
