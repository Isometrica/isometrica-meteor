'use strict';

var app = angular.module('isa.workinbox');

/**
 * 

 */
app.config(['$stateProvider', function($stateProvider) {

	$stateProvider
		.state('workinbox', {
			parent: 'organisation',
			url: '/workinbox',
			templateUrl: 'client/workinbox/workInboxView.ng.html',
			controller: 'WorkInboxController',
			controllerAs : 'vm',
			resolve : {
				_notificationsSub: function($meteor) {
		          return $meteor.subscribe('notifications');
		        },
		        inboxItems: function($meteor, _notificationsSub) {
		          return $meteor.collection(function() {
		            return Notifications.find({});
		          });
		        }
		    }
		})

		.state('workinbox.detail', {
			url: '/:itemId',
			templateUrl: 'client/workinbox/workInboxItem.ng.html',
			controller: 'WorkInboxItemController',
			controllerAs : 'vm',
			resolve : {

				inboxItem : function(inboxItems, $stateParams) {
					return _.findWhere(inboxItems, { _id: $stateParams.itemId });
				}

			}

		});
	
}]);
