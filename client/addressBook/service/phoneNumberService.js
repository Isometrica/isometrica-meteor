'use strict';

/**
 * @todo Remove these custom phone number methods..
 * @author Steve Fortune
 */
var app = angular.module('isa.addressbook');
var _PhoneNumberServiceRemote = function(IsometricaUser, Contact) {
	this.IsometricaUser = IsometricaUser;
	this.Contact = Contact;
};

_PhoneNumberServiceRemote.$inject = [ 'IsometricaUser', 'Contact' ];

/**
 * Returns either IsometricaUser or Contact based on the contactable
 * type.
 *
 * @param	contactable 	Object
 * @return 	Object
 */
_PhoneNumberServiceRemote.prototype.modelFor = function(contactable) {
	if (contactable.type === 'user') {
		return this.IsometricaUser;
	} else {
		return this.Contact;
	}
};

/**
 * Finds all phone numbers for a given contactable entity.
 *
 * @param	contactable Object
 * @return	Promise
 */
_PhoneNumberServiceRemote.prototype.all = function(contactable) {
	return this.modelFor(contactable).phoneNumbers({
		id: contactable.id
	}).$promise;
};

/**
 * Adds a phone number to a given contactable entity.
 *
 * @param	contactable Object
 * @param	phoneNumber	Object
 * @return	Promise
 */
_PhoneNumberServiceRemote.prototype.add = function(contactable, phoneNumber) {
	return this.modelFor(contactable).phoneNumbers.create({
		id: contactable.id
	}, phoneNumber).$promise;
};

/**
 * Deletes a phone number from a given user.
 *
 * @param	contactable Object
 * @param	phoneNumber	Object
 * @return	Promise
 */
_PhoneNumberServiceRemote.prototype.delete = function(contactable, phoneNumber) {
	return this.modelFor(contactable).phoneNumbers.destroyById({
		id: contactable.id
	}).$promise;
};

app.service('_PhoneNumberServiceRemote', _PhoneNumberServiceRemote);
app.service('_PhoneNumberServiceLocal', function() {});
isa.persistentService(app, 'PhoneNumberService');
