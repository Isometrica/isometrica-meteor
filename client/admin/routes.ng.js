var app = angular.module("isa.admin");

app.config(
	function($stateProvider){

	$stateProvider

    	.state('admin', {
    		parent : 'base',
		    url : '/admin',
		    templateUrl: 'client/admin/dashboard.ng.html',
		    controller : 'AdminDashboardCtrl',
		    controllerAs : 'vm',
		    data : {
		    	anonymous: false,
		    	roles : ['sysAdmin']
		    },
		    resolve : {
		    	currentUser: function($meteor) {
            		return $meteor.requireUser();
            	}
          	},
			onExit: function() {
	          
	        }
		})

		.state('admin.settings', {
			url : '/settings',
			templateUrl: 'client/admin/settings/settings.ng.html',
		    controller : 'SettingsCtrl',
		    controllerAs : 'vm'
		})

		.state('admin.systemTexts', {
			url : '/texts',
			templateUrl: 'client/admin/systemTexts/systemTexts.ng.html',
		    controller : 'SystemTextsCtrl',
		    controllerAs : 'vm'
		})

		.state('admin.users', {
			url : '/users',
			template: '<div>TODO</div>'
		});


	});