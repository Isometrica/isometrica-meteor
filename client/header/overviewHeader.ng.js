'use strict';

angular
  .module('isa')
  .directive('isaOverviewHeader', isaOverviewHeaderDirective);

function isaOverviewHeaderDirective() {
  return {
    replace : true,
    restrict : 'E',
    templateUrl: 'client/header/overviewHeader.ng.html',
    transclude : true,
    controller: function($scope, $state, $meteor, $rootScope) {

      //isaHeaderDirective($scope, $state);

      $scope.logout = function() {
        Meteor.logout(function(res) {
          $state.go('welcome');
        });
      };

      if ($rootScope.currentUser) {

        /**
         * Collection of the user's memberhips. Note that we don't need to
         * subscribe here as the memberships have already been subscribed
         * to in the overview routing.
         *
         * @var AngularMeteorCollection
         */
        $scope.memberships = $scope.$meteorCollection(function() {
          return Memberships.find({
            userId: $rootScope.currentUser ? $rootScope.currentUser._id : null
          });
        });

        $scope.$meteorSubscribe("accountSubscriptions");

        /**
         * Does the current user have an account associated with them?
         *
         * @return Boolean
         */
        $scope.hasAccount = function() {
          return !!AccountSubscriptions.find().count();
        };

      }
    }
  };
}
