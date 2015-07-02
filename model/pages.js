Pages = new Mongo.Collection("pages");

/*
 * TODO for now we allow all actions for all authenticated users
 */

Pages.allow({
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