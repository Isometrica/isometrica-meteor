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
  	type: String
  },
  'contents' : {
    type: String
  },
  'subject' : {      /* for emails only */
    type: String,
    optional: true
  }
}]);

SystemTexts.attachSchema(Schemas.SystemTexts);

/*
 * TODO update authorizations (should be tied to a role like [sysContentEditor] )
 */

SystemTexts.allow({
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
