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

      isaHeaderDirective($scope, $state);

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

        /**
         * Subscribe to accounts so that we can find the currrent user's
         * account and determine how to render the 'Account' button.
         */
        $scope.$meteorSubscribe(AccountSubscriptions, false)

      }
    }
  };
}
