/*
 * System wide settings
 *
 * @author Mark Leusink
 */

Settings = new Mongo.Collection("settings");

Schemas.Settings = new MultiTenancy.Schema([Schemas.IsaBase, {
  hostName : {
    label : "Hostname",
  	type: String
  },
  emailFromAddress : {
    label : 'Email \'from\' address',
    type: String
  }
}]);

Settings.attachSchema(Schemas.Settings);

/*
 * TODO don't allow anyone (should be tied to a role like [sysAdmin] )
 */

Settings.allow({
    insert: function (userId, doc) {
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        return false;
    },
    remove: function (userId, party) {
        return false;
    }
});
