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
      fieldType : 'isaRichText',
      taToolbar: "[['bold','italics'],['ul','ol'],['undo'],['insertLink','insertImage'],['html']]"
    }
  },
  'subject' : {      /* for emails only */
    type: String,
    label: 'Subject',
    optional: true,
    isa : {
      placeholder: 'For emails/dialog guidance summary'
    }
  },
  helpUrl: {
    label: 'Help URL',
    type: String,
    optional: true,
    isa: {
      placeholder: 'For dialog guidance bars'
    }
  }
}]);

SystemTexts.attachSchema(Schemas.SystemTexts);

/*
 * Allow edit access to users with sysAdmin role only
 */

SystemTexts.allow({
    insert: function (userId, doc) {   /* allow only for sys admins */
      return Roles.userIsInRole(userId, 'sysAdmin');
    },
    update: function (userId, doc, fields, modifier) {    /* allow only for sys admins */
      return Roles.userIsInRole(userId, 'sysAdmin');
    },
    remove: function (userId, doc) {  /* no one can remove texts */
      return false;
    }
});
