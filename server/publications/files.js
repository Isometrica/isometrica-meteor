'use strict';

//TODO: secure (filter by organisation or module?)

Meteor.publish('files', function() {
  return IsaFiles.find({});
});