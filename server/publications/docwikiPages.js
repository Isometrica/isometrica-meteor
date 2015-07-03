'use strict';

Meteor.publish("docwikiPages", function() {
    return DocwikiPages.find({});
});
