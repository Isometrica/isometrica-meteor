'use strict';

Meteor.publish("accounts", function() {
  return BillingAccounts.find({
    'users.$': this.userId
  });
});
