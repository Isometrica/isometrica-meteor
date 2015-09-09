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
      controllerAs: 'vm',
      resolve: {
        _notificationsSub: function($meteor) {
          return $meteor.subscribe('notifications');
        },
        inboxItems: function($meteor, _notificationsSub) {
          return $meteor.collection(function() {
            return Notifications.find({});
          });
        },
        actions: function(actionsService) {
          return actionsService.userActions().$ready;
        }
      },
      onExit: function(_notificationsSub, actions) {
        _notificationsSub.stop();
        actions.$unsubscribe();
      }
    })

    .state('workinbox.detail', {
      url: '/notification/:itemId',
      templateUrl: 'client/workinbox/workInboxItem.ng.html',
      controller: 'WorkInboxItemController',
      controllerAs: 'vm',
      resolve: {

        inboxItem: function(inboxItems, $stateParams) {
          return _.findWhere(inboxItems, {_id: $stateParams.itemId});
        }

      }

    })

    .state('workinbox.action', {
      url: '/action/:type/:actionId',
      template: function($stateParams) {
        return '<isa-' + $stateParams.type + '-action-view action="vm.action"></isa-' + $stateParams.type + '-action-view>';
      },
      controller: 'WorkInboxActionController',
      controllerAs: 'vm',
      resolve: {
        action: function(actions, $stateParams) {
          return _.findWhere(actions, {_id:$stateParams.actionId});
        }
      }
    })

}]);
