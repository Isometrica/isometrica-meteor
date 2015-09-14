'use strict';

angular
  .module('isa')
  .service('isaHandleErr', isaHandleErrService)
  .service('isaSubs', isaSubs);

/**
 * Unconditional love for your subscriptions.
 *
 * @author Steve Fortune
 */
function isaSubs($meteor, $q) {
  return {
    _subs: {},
    _subQs: {},
    _buildDescriptor: function(sub, name) {
      var self = this;
      return {
        name: name,
        subscription: sub,
        stop: function() {
          this.subscription.stop();
          delete self._subs[name];
        }
      };
    },
    get: function(name, args) {
      var self = this;
      var proc = self._subQs[name] || self._subs[name];
      if (!proc) {
        var cleanupProc = function() {
          delete self._subQs[name];
        };
        proc = $meteor.subscribe.apply($meteor, args).then(function(sub) {
          var desc = self._buildDescriptor(sub, name);
          self._subs[name] = desc;
          cleanupProc();
          return desc;
        }, cleanupProc);
        self._subQs[name] = proc;
      }
      return proc;
    },
    destroy: function(name) {
      var desc = self._subs[name];
      if (desc) {
        desc.stop();
      }
    },
    _procressConf: function(conf) {

      var name;
      var args;
      if (angular.isString(conf)) {
        name = conf;
      } else if (angular.isObject(conf)) {
        name = conf.name;
        args = conf.args;
      } else {
        throw new Error("Sub spec type unsupported");
      }
      return this.get(name, args);

    },
    _processConfArr: function(confArr) {

      var self = this;
      return $q.all(angular.map(confArr, function(conf) {
        return $q.when(self._procressConf(conf));
      })).then(function(descs) {
        return self._buildDescriptor(descs);
      });

    },
    require: function(subConf) {
      return angular.isArray(subConfs) ?
        this._processConfArr(subConf) :
        this._processConf(subConf);
    }
  };
};

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
