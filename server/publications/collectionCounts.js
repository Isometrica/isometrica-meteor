/* TODO: secure */

Meteor.publish('PubUserCounter', function() {
  Counts.publish(this, 'userCounter', Meteor.users.find());
});

Meteor.publish('PubDocCounter', function() {
  Counts.publish(this, 'docCounter', Modules.find( { type : 'docwiki', inTrash : false } ));
});