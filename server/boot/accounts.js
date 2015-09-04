'use strict';

Accounts.urls.enrollAccount = function(token) {
  return Meteor.absoluteUrl('enroll/' + token);
};
