'use strict';

angular
  .module('isa.user')
  .service('isaAccept', isaAcceptService);

/**
 * Service that encapsulates methods for accepting an invitation.
 * This service will find an inactive membership based on the membership
 * id in the route and attempt to update it's 'isAccepted' property.
 *
 * On successful acceptance, it will trigger a redirect to the appropriate
 * organisation.
 *
 * On failing to accept the membership, it will throw.
 *
 * The collections that this service queries requires a subscription
 * to the 'inactiveMemberships' publication.
 *
 * @author Steve Fortune
 */
function isaAcceptService($stateParams, $state, $q, isaHandleErr) {

  return {
    accept: function() {
      var memId = $stateParams.membershipId;
      if (!memId) {
        throw new Error("No membershipId found in route params");
      }
      return $q(function(resolve, reject) {
        $meteor.call('acceptMembership', memId).then(function() {
          $state.go('overview');
        }, isaHandleErr());
      });
    }
  };

}
