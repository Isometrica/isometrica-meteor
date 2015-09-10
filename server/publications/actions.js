Meteor.publish('actions', function() {
  return Actions.find({});
});

Meteor.publish('action', function(id) {
  return Actions.find({_id: id});
});

Meteor.publish('action-type', function(type) {
  return Actions.find({type: type});
});
