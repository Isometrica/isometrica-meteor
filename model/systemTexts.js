/*
 * Collection of text to be used at various locations in the system. This collection contains
 * - help texts (displayed in a model or a guidance bar)
 * - email texts (used when emails/ notifications are sent)
 *
 * @author Mark Leusink
 */

SystemTexts = new Mongo.Collection("systemTexts");

Schemas.SystemTexts = new MultiTenancy.Schema([Schemas.IsaBase, {
  'textId' : {
    label: 'Id',
  	type: String
  },
  'contents' : {
    label: 'Contents',
    type: String,
    isa : {
      fieldType : 'isaTextarea'
    }
  },
  'subject' : {      /* for emails only */
    type: String,
    label: 'Subject',
    optional: true,
    isa : {
      focus : true
    }
  }
}]);

SystemTexts.attachSchema(Schemas.SystemTexts);

/*
 * Allow edit access to users with sysAdmin role only
 */

SystemTexts.allow({
    insert: function (userId, doc) {    /* no one can create new texts */
      return false;
    },
    update: function (userId, doc, fields, modifier) {    /* allow only for sys admins */
      return Roles.userIsInRole(userId, 'sysAdmin');
    },
    remove: function (userId, doc) {  /* no one can remove texts */
      return false;
    }
});
