'use strict';

Meteor.publish("systemTexts", function() {

    return SystemTexts.find({}, { sort : {textId : 1} });

});
