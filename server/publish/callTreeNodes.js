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

  Users.find(predicate, isa.handleQuery(function(users) {
    Contacts.find(predicate, isa.handleQuery(function(contacts) {

      var typeFn = function(type) {
          return function(item) {
              item.type = type;
          }
      }

      users.forEach(typeFn('user'));
      contacts.forEach(typeFn('contact'));

      var results = users.concat(contacts).sort(function(a, b) {
          var res = 0;
          if (a.name < b.name) {
              res = -1;
          } else {
              res = 1;
          }
          return res;
      });

      cb(null, results);

    }));
  }));

};
