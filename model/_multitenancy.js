
/**
 * Namespace for multitenancy magic. Here's how it works:
 *
 * # Server
 *
 * - All CRUD methods need a current user otherwise 403.
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
 * - Has a global 'currentOrgId' variable stored in a Session.
 * - CRUD collection hooks which append the orgId to all query
 *   selectors.
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
 *   1)Pretty much as you did before, requiring a current logged in user
 *     and explicitly specifying the orgId in CRUD ops where necessary
 *     (e.g. calling `insert`, to specifying where you want the doc inserted)
 *   2)Masquarading. Use the `masqOp` method to fake being part of an
 *     organisation for the duration of the query. This _doesn't_ require
 *     a current logged in user and is perfect for system config server code.
 *     e.g. for creating some sample data !
 *
 * - `find`, `findOne`, `update` and `remove` will all check whether
 *   the document that you're accessing is part of an organisation
 *   that you're a member of.
 * - Be mindful of the `_orgId` attribute on the server. You should
 *   ensure that your queries don't reference documents ambiguous
 *   to an organisation by specifying the orgId if you have to.
 * - `insert` will require you to specify an `_orgId` explicitly.
 *
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
 * @constructor
 * Proxies Mongo.Collection ctor. Applies multi-tenancy hooks to the
 * collection.
 *
 * @note  No update / remove hooks are required. find / findOne are
 *        called before update and remove anyway.
 * @host  Server | Client
 * @param name    String
 * @see   Mongo.Collection
 */
MultiTenancy.Collection = function(name) {

  var col = new Mongo.Collection(name);
  var constrainFind;
  var constrainInsert;

  var sanatizeUpdate = function(userId, doc, fieldNames, modifier) {
    if (modifier.$set) {
      delete modifier.$set._orgId;
    }
  };

  var assertUser = function(userId) {
    if (!userId) {
      throw new Meteor.Error(403, 'Login required to access multi-tenancy collection');
    }
  };

  if (Meteor.isServer) {

    var findOrgIds = function(userId) {
      return MultiTenancy.memberships.find({
        userId: userId
      }, {
        _orgId: 1
      }).fetch().map(function(mem) {
        return mem._orgId;
      });
    };
    var assertUserOrg = function(userId, orgId) {
      var orgIds = findOrgIds(userId);
      if(!~orgIds.indexOf(doc._orgId)) {
        throw new Meteor.Error(403, 'User does not have access to this organisation');
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
      if (bypassQuery(sel)) {
        return;
      }
      assertUser();
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
      if (bypassQuery(sel)) {
        return;
      }
      assertUser();
      if (!doc._orgId) {
        throw new Meteor.Error(403,
          'No orgId. Make sure that youve configured the client correctly, ' +
          'or if you\' calling `insert` from the server side make sure you ' +
          'pass an `_orgId`!'
        );
      }
      assertUserOrg(userId, doc._orgId);
    };

  } else {

    var assertConfigured = function() {
      assertUser();
      if (!MultiTenancy.orgId()) {
        throw new Meteor.Error(403, 'Set MultiTenancy.orgId()');
      }
    };
    constrainFind = function(userId, sel) {
      assertConfigured();
      sel._orgId = MultiTenancy.orgId();
    };
    constrainInsert = function(user, doc) {
      assertConfigured();
      doc._orgId = MultiTenancy.orgId();
    };

  }

  col.before.insert(constrainInsert);
  col.before.find(constrainFind);
  col.before.findOne(constrainFind);
  col.before.update(sanatizeUpdate);

  return col;

};

/**
 * Base schema for partitioned collections.
 *
 * @host Client | Server
 * @var SimpleSchema
 */
MultiTenancy.PartitionSchema = new SimpleSchema({
  _orgId: {
    type: String
  }
});

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
    schemaHeirarchy.unshift(MultiTenancy.PartitionSchema);
  } else if (_.isObject(schemaHeirarchy)) {
    schemaHeirarchy = [MultiTenancy.PartitionSchema, schemaHeirarchy];
  } else {
    throw new Error("Unsupported schema type");
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
  MultiTenancy.masqueradeOrg.withValue(orgId, opFn);
};

/**
 * Get / set the current org id on the client.
 *
 * @param orgId falsy | String
 * @host Client
 */
MultiTenancy.orgId = function(orgId) {
  assertHost();
  var key = 'MultiTenancy.orgId';
  if (orgId) {
    return Session.get(key);
  } else {
    Session.set(key, orgId);
  }
};

/**
 * Convenience function. Listens for orgId in $startRouteChange event handler
 * on an angular.js module and updates orgId accordingly.
 *
 * @note  Haven't decided whether this is ugly or convenient to have
 *        the fn here.
 * @host Client
 * @param ng  Angular.module
 */
MultiTenancy.bindNgState = function(ng) {
  assertHost();
  ng.run(['$rootScope', '$stateParams', function($rootScope, $stateParams) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      MultiTenancy.orgId(toStateParams.orgId);
    });
  }]);
};

/**
 * Collection of different organisations.
 *
 * @todo What on the client ?
 * @host Client | Server
 * @var Mongo.Collection
 */
MultiTenancy.organisations = new Mongo.Collection('organisations');

/**
 * Partitioned collection of memberships of different organisations.
 *
 * @todo What on the client ?
 * @host Client | Server
 * @var MultiTenancy.Collection
 */
MultiTenancy.memberships = new MultiTenancy.Collection('memberships');
