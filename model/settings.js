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
 * Allow edit access to users with sysAdmin role only
 */

Settings.allow({
    insert: function (userId, doc) {  /* no one can create a new settings doc */
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        return Roles.userIsInRole(userId, 'sysAdmin');
    },
    remove: function (userId, doc) {
        return false;
    }
});
