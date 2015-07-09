'use strict';

/*
 * TODO: only load the modules that the user has access to
 */
Meteor.publish("modules", function() {
    return Modules.find({});
});
