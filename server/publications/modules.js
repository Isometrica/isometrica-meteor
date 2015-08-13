'use strict';

Meteor.publish("modules", function() {
    return Modules.find({});
});
