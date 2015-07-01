'use strict';

var app = angular.module('isa.addressbook');

/**
 * Utility services that assembles the name of an event.
 *
 * @param	entityType		String
 * @param	id				String | Number
 * @param	operationType	String
 * @author 	Steve Fortune
 */
app.service('EventNameAssembler', function() {
	return function(entityType, operationType, id) {
		var eventName = entityType + '.';
		if (typeof id !== 'undefined') {
			eventName += id + '.';
		}
		eventName += operationType;
		return eventName;
	};
});
