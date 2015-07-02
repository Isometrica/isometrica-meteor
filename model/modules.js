/*
 * Modules in Isometrica
 *
 * @author Mark Leusink
 */


Modules = new Mongo.Collection("modules");

/*
 * TODO for now we allow all actions for authenticated users only
 */

Modules.allow({
    insert: function (userId, doc) {
        return userId;
    },
    update: function (userId, doc, fields, modifier) {
        return userId;
    },
    remove: function (userId, party) {
        return userId;
    }
});