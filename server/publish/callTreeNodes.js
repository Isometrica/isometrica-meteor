'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(search) {

  var Users = Meteor.users;
  var predicate = {
      where: {
          name: {
              like: '.*' + search + '.*'
          }
      },
      limit: 5
  };

  return Users.find(predicate, isa.handleQuery(function(users) {
    Contacts.find(predicate, isa.handleQuery(function(contacts) {

      var typeFn = function(type) {
          return function(item) {
              item.type = type;
          }
      }

      users.forEach(typeFn('user'));
      contacts.forEach(typeFn('contact'));

      var results = users.concat(contacts).sort(isa.alphabetically());

      cb(null, results);

    }));
  }));

});
