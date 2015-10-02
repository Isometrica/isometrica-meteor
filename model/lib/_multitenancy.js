
/**
 * Namespace for multitenancy magic.
 *
 * @author  Steve Fortune
 */
MultiTenancy = {};

function rootPub() {
  return Memberships.find({
    isActive: true,
    userId: this.userId
  });
};

function wrapChildCursor(child) {
  child.find = function(mem) {
    var cur;
    // TODO: Set organisation id envar to mem._ordId
    cur = docFn(mem);
    return cur;
  };
}

MultiTenancy.publish = function(name, children) {
  if (_.isArray(children)) {
    _.each(children, wrapChildCursor);
  } else if (_.isObject) {
    wrapChildCursor(children);
  } else {
    throw new Error("Unsupported pub.");
  }
  Meteor.publishComposite(name, {
    find: rootPub,
    children: children
  });
};

/**
 * Assert that the application is running on the correct host
 *
 * @throws  Meteor.Error
 * @param   server        Boolean
 */
var assertHost = function(server) {
  if (!!server !== Meteor.isServer) {
    var hostName = (isServer ? 'server' : 'client');
    throw new Meteor.Error(404, 'Only available on the ' + hostName);
  }
};

/**
 * Is the given id one of the accepted types for ids.
 *
 * @param   id
 * @return  Boolean
 */
var isId = function(id) {
  return !!id && (_.isString(id) || (id instanceof Mongo.ObjectID));
};

/**
 * Applies multi-tenancy constraints to a collection using collection-hooks.
 *
 * @note  No update / remove hooks are required. find / findOne are
 *        called before update and remove anyway.
 * @param col Mongo.Collection
 * @host  Server | Client
 */
MultiTenancy.applyConstraints = function(col) {

  var name = col._name;
  var constrainFind;
  var constrainInsert;

  var sanitizeUpdate = function(userId, doc, fieldNames, modifier) {
    if (modifier && modifier.$set) {
      delete modifier.$set._orgId;
    }
  };

  var assertUser = function(userId) {
    if (!userId) {
      throw new Meteor.Error(403, 'Login required to access ' + name);
    }
  };

  if (Meteor.isServer) {

    var findOrgIds = function(userId) {
      return MultiTenancy.memberships.direct.find({
        userId: userId,
        isAccepted: true
      }, {
        _orgId: 1
      }).fetch().map(function(mem) {
        return mem._orgId;
      });
    };

    var containsId = function(arr, id) {
      for (var i = 0; i < arr.length; ++i) {
        if (EJSON.equals(arr[i], id) || EJSON.equals(id, arr[i])) {
          return true;
        }
      }
      return false;
    };

    var assertUserOrg = function(userId, orgId) {
      var orgIds = findOrgIds(userId);
      if(!containsId(orgIds, orgId)) {
        throw new Meteor.Error(403, 'User does not have permission to access this doc in ' + name);
      }
    };

    var bypassQuery = function(doc) {
      var masqId = MultiTenancy.masqOrgId.get();
      if (masqId) {
        doc._orgId = masqId;
        return !MultiTenancy.authMasq.get();
      }
      return false;
    };

    constrainFind = function(userId, sel) {
      sel = sel || {};
      if (bypassQuery(sel)) {
        return;
      }

      // TODO - investigate security ramifications of $$isaUserId
      if (!userId && sel.$$isaUserId) {
        userId = sel.$$isaUserId;
      }
      delete sel.$$isaUserId;

      assertUser(userId);
      var orgIds = findOrgIds(userId);
      if (isId(sel._orgId)) {
        assertUserOrg(userId, sel._orgId);
      } else {
        sel._orgId = {
          $in: orgIds
        };
      }
    };

    constrainInsert = function(userId, doc) {
      if (bypassQuery(doc)) {
        return;
      }
      assertUser(userId);
      if (!doc._orgId) {
        throw new Meteor.Error(403, '`_orgId` is required; make sure client is setup correctly');
      }
      assertUserOrg(userId, doc._orgId);
    };

  } else {

    constrainFind = function(userId, sel) {
      assertUser(userId);
      sel = sel || {};
      var orgId = MultiTenancy.orgId();
      var collections = MultiTenancy.filteredCollections();
      if ((!collections || !!~collections.indexOf(name)) && orgId) {
        sel._orgId = orgId;
      }
    };

    constrainInsert = function(userId, doc) {
      assertUser(userId);
      if (!MultiTenancy.orgId()) {
        throw new Meteor.Error(403, 'Set MultiTenancy.orgId() to access ' + name);
      }
      doc._orgId = MultiTenancy.orgId();
    };

  }

  col.before.insert(constrainInsert);
  col.before.find(constrainFind);
  col.before.findOne(constrainFind);
  col.before.update(sanitizeUpdate);

};

/**
 * @constructor
 * Syntactic-sugar for instantiating partitioned collections:
 * `new MultiTenancy.Collection(..)`
 *
 * @host  Server | Client
 * @param name    String
 * @see   Mongo.Collection
 */
MultiTenancy.Collection = function(name, opts) {
  var col = new Mongo.Collection(name, opts);
  MultiTenancy.applyConstraints(col);
  return col;
};

/**
 * Base schema for partitioned collections.
 *
 * @host Client | Server
 * @var SimpleSchema
 */
MultiTenancy.partitionSchema = {
  _orgId: {
    type: String,
    optional: true
  }
};

/**
 * @constructor
 * Create a schema configured for MultiTenancy. Proxies the SimpleSchema
 * ctor.
 *
 * @host Client | Server
 * @param   schemaHeirarchy  Array | Object
 * @return  SimpleSchema
 */
MultiTenancy.Schema = function(schemaHeirarchy) {
  if (_.isArray(schemaHeirarchy)) {
    schemaHeirarchy.unshift(MultiTenancy.partitionSchema);
  } else {
    schemaHeirarchy = [MultiTenancy.partitionSchema, schemaHeirarchy];
  }
  return new SimpleSchema(schemaHeirarchy);
};

/**
 * @host Server
 * @var Meteor.EnvironmentVariable
 */
MultiTenancy.masqOrgId = new Meteor.EnvironmentVariable();

/**
 * @host Server
 * @var Meteor.EnvironmentVariable
 */
MultiTenancy.authMasq = new Meteor.EnvironmentVariable();

/**
 * Masquerades the operation as part of an organisation. Should be
 * used only in trusted server-side configuration code as a mechanism
 * to completely bypass partitioning. An example of this might be
 * in a boot script that needs to configure some sample organisations.
 *
 * If you want to marsquarade as an organisation but also enforce
 * access constraints, set auth to true.
 *
 * @host  Server
 * @param orgId String
 * @param opFn  Function
 * @param auth  Boolean
 */
MultiTenancy.masqOp = function(orgId, opFn, auth) {
  assertHost(true);
  var self = MultiTenancy;
  self.authMasq.withValue(!!auth, function() {
    self.masqOrgId.withValue(orgId, opFn);
  });
};

/**
 * @var String
 */
MultiTenancy.filterCollectionsKey = 'MultiTenancy.filteredCollections';

/**
 * @var String
 */
MultiTenancy.orgIdKey = 'MultiTenancy.orgIdKey';

/**
 * Gets the current org id on the client.
 *
 * @return String
 * @host Client
 */
MultiTenancy.orgId = function() {
  assertHost();
  return Session.get(MultiTenancy.orgIdKey);
};

/**
 * Gets the current org id on the client.
 *
 * @param orgId String
 * @host Client
 */
MultiTenancy.setOrgId = function(orgId) {
  assertHost();
  return Session.set(MultiTenancy.orgIdKey, orgId);
};

/**
 * Get specific collections to partition. Sometimes on the client, we only
 * want to partition data in specific collections. Setting this property on
 * the client restricts the find constraints to only those specified here.
 *
 * @return Array
 * @host Client
 */
MultiTenancy.filteredCollections = function() {
  assertHost();
  return Session.get(MultiTenancy.filterCollectionsKey);
};

/**
 * Set specific collections to partition on the client.
 *
 * @param collections Array | falsy
 * @throws Error
 * @host Client
 */
MultiTenancy.setFilteredCollections = function(collections) {
  assertHost();
  if (collections && !_.isArray(collections)) {
    throw new Error("Filtered collections must be an array");
  }
  Session.set(MultiTenancy.filterCollectionsKey, collections);
};

/**
 * Convenient Angular.js `run` recipe. Listens for to `$startRouteChange`
 * and bind the specified routeParam to the MultiTenancy session. What's
 * cool about this is that you can configure which collections are partitioned
 * for different states ! By default, everything is partitioned but if
 * you only want some collections to be partitioned you can do this..
 *
 *  app.run(MultiTenancy.bindNgState({
 *    'overview': [ 'module', 'membership' ],
 *    'noPartitioning': [],
 *    ...
 *  }));
 *
 * @host Client
 * @return Array
 */
MultiTenancy.bindNgState = function(stateMatcher) {

  assertHost();
  stateMatcher = stateMatcher || {};

  var stateConfig = stateMatcher.stateConfig;
  var routeParam = stateMatcher.routeParam || 'orgId';

  return ['$rootScope', '$stateParams', function($rootScope, $stateParams) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      var param = toStateParams[routeParam];
      var collections = stateConfig[toState.name];
      MultiTenancy.setOrgId(param);
      MultiTenancy.setFilteredCollections(collections);
    });
  }];

};

/**
 * Call a multitenancy method. This wraps `Meteor.call` to append the
 * client-side orgId onto the method arguments. Note that you should
 * be calling methods that require multitenancy (i.e., as defined with
 * `MultiTenancy.method`).
 *
 * Use in the same way you would `Meteor.call`
 *
 * @host Client
 */
MultiTenancy.call = function() {
  assertHost();
  var orgId = MultiTenancy.orgId();
  var args = Array.prototype.slice.call(arguments);
  if (!orgId) {
    throw new Error(403, "Org id must be set to call an mtMethod");
  }
  if (_.isFunction(_.last(args))) {
    args.splice(args.length - 1, 0, orgId);
  } else {
    args.push(orgId);
  }
  Meteor.call.apply(null, args);
};

/**
 * Use this to define a method that, on the server side, requires the
 * client-side's mutlitenancy state.
 *
 * @example
 *
 * - I want to define a method that runs on the server and client which
 *   inserts several `docwikiPages`.
 * - This method invokation will work fine on the client, as the orgId
 *   is just pulled from the state and appended to the queries.
 * - But on the server, there is no client-side multi-tenancy state.
 *   Its designed not to know about what organisation the client is
 *   trying to access.
 * - This is because we don't want to maintain uneccessary state about
 *   the client on the server.
 * - The obvious solution is to pass the `orgId` to all of these special,
 *   edge-case method calls.
 * - Which sucks, so `MultiTenancy` does it for you.
 * - Use `MultiTenancy.method` on the server-side and `MultiTenancy.call`
 *   on the client side and all of that state will be passed a long to
 *   the server without you having to do a thing.
 *
 * Server:
 *
 * ``` Javascript
 *
 *  Meteor.mtMethods({
 *    updateUser: function(profile, superpowers) {
 *      Memberships.update({ userId: Meteor.userId() }, {...});
 *      ...
 *    },
 *    makeSomeDocWikiPages: function(...) {...}
 *    ...
 *  });
 *  Meteor.methods({
 *    somethingMundane: function(...) {...},
 *    ...
 *  });
 *
 *  // Or
 *
 *  Meteor.methods({
 *    updateUser: MultiTenancy.method(function(profile, superpowers) {...}),
 *    makeSomeDocWikiPages: MultiTenancy.method(function(...) {...}),
 *    somethingMundane: function(...) {...}
 *  });
 *
 * ```
 *
 * Client:
 *
 * ``` Javascript
 *
 *  MultiTenancy.call('updateUser', {firstName: 'Steve', lastName: 'Fortune'}, {}, function() {...});
 *  MultiTenancy.call('makeSomeDocWikiPages');
 *  Meteor.call('somethingMundane', function(err, res) {...});
 *
 * ```
 *
 * The two most compelling cases I've seen for these proxy `method`/`call`
 * functions are:
 * - Inserting new documents in server-side code
 * - Updating documents _not by ID_, where the _orgId is a prime attribute
 *   of the entity and thus, is being relied upon for identification.
 *   For example, updating a membership where only the userId is specified.
 *
 * @todo    Add some more useful methods, like orgId, etc.
 * @param   fn        Function
 * @return  Function
 * @host    Server | Client
 */
MultiTenancy.method = function(fn) {
  return function() {
    var ctx = this;
    var args = Array.prototype.slice.call(arguments);
    var ret;
    if (Meteor.isServer) {
      var orgId = _.last(args);
      if (!isId(orgId)) {
        throw new Meteor.Error(400, "Couldn't find last param. This method requires an orgId!");
      }
      MultiTenancy.masqOp(orgId, function() {
        ret = fn.apply(ctx, args);
      }, true);
    } else {
      ret = fn.apply(ctx, args);
    }
    return ret;
  };
};

/**
 * Convenient method; wraps your `methods` using `MultiTenancy.method`.
 * Call this in exactly the same way you would `Meteor.methods` but
 * for methods that require multitenancy.
 *
 * @param methods Object
 * @host  Server | Client
 */
Meteor.mtMethods = function(methods) {
  Meteor.methods(_.object(_.map(methods, function(mFn, mName) {
    return [mName, MultiTenancy.method(mFn)];
  })));
};

/**
 * Returns a config recipe for decorating `$meteor` with `mtCall`.
 * `mtCall` wraps `MultiTenancy.call`.
 *
 * @return Array
 * @host Client
 */
MultiTenancy.ngDecorate = function() {
  assertHost();
  return ['$provide', function($provide) {
    $provide.decorator('$meteor', ['$delegate', '$q', function($meteor, $q) {
      $meteor.mtCall = function() {
        var args = Array.prototype.slice.call(arguments);
        var ctx = this;
        return $q(function(resolve, reject) {
          MultiTenancy.call.apply(ctx, args.concat(function(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }));
        });
      };
      return $meteor;
    }]);
  }];
};

/**
 * Collection of different organisations.
 *
 * @host Client | Server
 * @var Mongo.Collection
 */
MultiTenancy.organisations = new Mongo.Collection('organisations');

/**
 * Partitioned collection of memberships of different organisations.
 *
 * @note This can't be partitioned, because then we'd get infinite
 * recursion when querying it in the collection hooks.
 * @host Client | Server
 * @var Mongo.Collection
 */
MultiTenancy.memberships = new MultiTenancy.Collection('memberships');
