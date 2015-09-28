Meteor.publish('history', function(reference) {
  return History.find({reference: reference}, {sort: [['at', 'desc']]});
});
