'use strict';

Meteor.publish("settings", function() {

    return Settings.find();

});
