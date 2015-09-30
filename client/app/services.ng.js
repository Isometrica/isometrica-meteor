'use strict';

angular
  .module('isa')
  .service('isaHandleErr', isaHandleErrService);

/**
 * A function that wraps a callback to perform appropriate error handling.
 * Usage:
 *
 *  Meteor.users.update(..., isaHandleErr(function() {... }));
 *
 * @author Steve Fortune
 */
function isaHandleErrService($stateParams, $state, $q, growl) {

  return function(cb) {
    return function(err) {
      if (err) {
        growl.error("There was an error handling your request: " + err.message);
      } else if (cb) {
        cb();
      }
    }
  };

}
