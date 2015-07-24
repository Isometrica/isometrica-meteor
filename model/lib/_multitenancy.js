
/**
 * Namespace for multitenancy magic. Here's how it works:
 *
 * # Server
 *
 * - All CRUD methods need a current user otherwise 403. The only
 *   exception is if the client code is masquarading.
 * - `find`, `findOne`, `update` and `remove` queries are constrained
 *   to where.$in the current user's organisations. Server should
 *   publish all documents that the user has access to across all of
 *   their organisations. Credits to MH for this suggestion.
 * - You can also specify the _orgId in the selectors of `find`,
 *   `findOne`, `update` and `remove` methods. If you specify an orgId
 *   that you can't access, 403. This is useful for bypassing query
 *   constraints on the server side.
 * - `insert` doc must have an `_orgId` otherwise 403 (this is added
 *   transparently in the client side's `insert` hook).
 * - `update` shouldn't allow _orgIds to be modified.
 *
 * # Client
 *
 * - Has a global 'orgId' variable stored in a Session.
 * - CRUD collection hooks which append the orgId to query
 *   selectors.
 * - CRUD methods all require a current logged in user. `insert`
 *   will require that an orgId is set.
 * - You can customize which collections that `find` appends
 *   the `orgId` to by setting a `filteredCollections` array.
 * - The `orgId` might be updated on `$startRouteChange`using
 *   the $stateParams.
 *
 * # Why not constrain all the queries on the server side?
 *
 * - We need to avoid maintaining state about which specific
 *   organisation a user is viewing on the server side; as its
 *   per-client data it makes sense to maintain it on the client.
 * - Doing so on the server runs into all sorts of design issues
 *   when the same client is viewing different organisations through
 *   different browser windows.
 *
 * # How do I perform operations on the server side?
 *
 * - You have 2 options:
 *
 *   1) Pretty much as you did before, requiring a current logged in user
 *      and explicitly specifying the orgId in CRUD ops where necessary
 *      (e.g. calling `insert`, to specifying where you want the doc inserted)
 *   2) Masquarading. Use the `masqOp` method to fake being part of an
 *      organisation for the duration of the query. This _doesn't_ require
 *      a current logged in user and is perfect for system config server code.
 *      e.g. for creating some sample data !
 *   3) @see `MultiTenancy.method` for defining and calling multi-tenancy
 *      methods on the client / server.
 *
 * - `find`, `findOne`, `update` and `remove` will all check whether
 *   the document that you're accessing is part of an organisation
 *   that you're a member of.
 * - Be mindful of the `_orgId` attribute on the server. You should
 *   ensure that your queries don't reference documents ambiguous
 *   to an organisation by specifying the orgId if you have to.
 * - `insert` will require you to specify an `_orgId` explicitly.
 *
 * # Genericism
 *
 * - Interesting to note: the constraint that _orgIds must be valid
 *   organisation IDs isn't really enforced.
 * - This MultiTenancy module could even be used for a wider range of
 *   application !
 *
 * @todo    In some cases, we may want to create a subscription to
 *          a partitioned collection without actually being logged in
 *          in preparation for a login. Might be nice to have a 'hardFail'
 *          param that we can pass to the ctor to prevent the col from
 *          throwing.
 * @todo    What if a user is added to an org ? Probably use
 *          Cursor.observeChanges to make the `constrainFind`
 *          reactive.
 * @author  Steve Fortune
 */
MultiTenancy = {};

'use strict';

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

  var sanatizeUpdate = function(userId, doc, fieldNames, modifier) {
    if (modifier.$set) {
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
        userId: userId
      }, {
        _orgId: 1
      }).fetch().map(function(mem) {
        return mem._orgId;
      });
    };

    var assertUserOrg = function(userId, orgId) {
      var orgIds = findOrgIds(userId);
      if(!~orgIds.indexOf(orgId)) {
        throw new Meteor.Error(403, 'User does not permission to access this doc in ' + name);
      }
    };

    var bypassQuery = function(doc) {
      var masqId = MultiTenancy.masqOrgId.get();
      if (masqId) {
        doc._orgId = masqId;
        return true;
      }
      return false;
    };

    constrainFind = function(userId, sel) {
      sel = sel || {};
      if (bypassQuery(sel)) {
        return;
      }
      assertUser(userId);
      var orgIds = findOrgIds(userId);
      if (sel._orgId) {
        assertUserOrg(userId, doc._orgId);
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
  col.before.update(sanatizeUpdate);

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
 * Masquerades the operation as part of an organisation. Should be
 * used only in trusted server-side configuration code as a mechanism
 * to completely bypass partitioning. An example of this might be
 * in a boot script that needs to configure some sample organisations.
 *
 * @host  Server
 * @param orgId String
 * @param opFn  Function
 */
MultiTenancy.masqOp = function(orgId, opFn) {
  assertHost(true);
  MultiTenancy.masqOrgId.withValue(orgId, opFn);
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

}

/**
 * Call a multitenancy method. This wraps `Meteor.call` to append the
 * client-side orgId onto the method arguments. Note that you should
 * be calling methods that require multitenancy (i.e., as defined with
 * `MultiTenancy.method`).
 *
 * Use in the same way you would `Meteor.call`
 */
MultiTenancy.call = function() {
  assertHost();
  var orgId = MultiTenancy.orgId();
  if (!orgId) {
    throw new Error(403, "Org id must be set to call an mtMethod");
  }
  if (_.isFunction(_.last(arguments))) {
    arguments.splice(arguments.length - 2, orgId);
  } else {
    arguments.push(orgId);
  }
  Meteor.call.apply(null, arguments);
};

/**
 * Use this to define a method that, on the server side, requires the
 * client-side's mutlitenancy state.
 *
 * @example
 *
 * - I want to define a method that runs on the server and client which
 *   finds and updates several `docwikiPages`.
 * - This method invokation will work fine on the client, as the orgId
 *   if just pulled from the state and appended to the queries.
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
 * @param   fn        Function
 * @return  Function
 */
MultiTenancy.method = function(fn) {
  assertHost(true);
  return function() {
    var ctx = this;
    if (Meteor.isServer) {
      var orgId = _.last(arguments);
      if (!orgId) {
        throw new Error(400, "Couldn't find last param. This method requires an orgId!");
      }
      MultiTenancy.masqOp(orgId, function() {
        fn.apply(ctx, arguments);
      });
    } else {
      fn.apply(ctx, arguments);
    }
  }
};

/**
 * Convenient method; wraps your `methods` using `MultiTenancy.method`.
 * Call this in exactly the same way you would `Meteor.methods` but
 * for methods that require multitenancy.
 *
 * @param methods Object
 */
Meteor.mtMethods = function(methods) {
  assertHost(true);
  Meteor.methods(_.mapObject(methods, function(mName, mFn) {
    return MultiTenancy.method(mFn);
  }));
};

/**
 * Returns a config recipe for decorating `$meteor` with `mtCall`.
 * `mtCall` is wraps `MultiTenancy.call`.
 *
 * @return Array
 */
MultiTenancy.ngDecorate = function() {
  return ['$provide', '$q', function($provide, $q) {
    $provide.decorate('$meteor', function($meteor) {
      $meteor.mtCall = function() {
        var args = arguments;
        var ctx = this;
        $q(function(resolve, reject) {
          MultiTenancy.call.apply(ctx, args.concat(function(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }));
        });
      };
    });
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
