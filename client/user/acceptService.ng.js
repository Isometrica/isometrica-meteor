'use strict';

angular
  .module('isa.user')
  .factory('isaAccept', isaAcceptFactory);

/**
 * Service that encapsulates methods for accepting an invitation. It does
 * this simply by calling `acceptMembership` method, which exists only as
 * a server-side method (doesn't require any subscription).
 *
 * On successful acceptance, it will trigger a redirect to the appropriate
 * organisation.
 *
 * @author Steve Fortune
 */
function isaAcceptFactory($stateParams, $state, $meteor, isaHandleErr) {
  return {
    accept: function() {
      var self = this;
      return $meteor.call('acceptMembership', $stateParams.membershipId).then(function(orgId) {
        $state.go('overview');
      }, isaHandleErr());
    }
  };
}
