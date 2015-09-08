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
		    },
			onExit: function(_notificationsSub) {
				_notificationsSub.stop();
			}
		})

		.state('workinbox.detail', {
			url: '/notification/:itemId',
			templateUrl: 'client/workinbox/workInboxItem.ng.html',
			controller: 'WorkInboxItemController',
			controllerAs : 'vm',
			resolve : {

				inboxItem : function(inboxItems, $stateParams) {
					return _.findWhere(inboxItems, { _id: $stateParams.itemId });
				}

			}

		})

		.state('workinbox.action', {
			url: '/action/:type/:actionId',
			templateUrl: function($stateParams) {
				return 'client/workinbox/' + $stateParams.type + '/view.ng.html';
			},
			controller: 'WorkInboxActionController',
			controllerAs: 'vm',
			resolve: {
				action: function($stateParams, $meteor) {
					switch ($stateParams.type) {
						case 'meeting': return $meteor.object(MeetingActions, $stateParams.actionId, false);
						default: throw Error('Invalid action type: ' + $stateParams.type);
					}
				}
			}
		})

}]);
