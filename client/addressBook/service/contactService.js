'use strict';

/**
 * @author Steve Fortune
 */
var app = angular.module('isa.addressbook');
var _ContactServiceRemote = function(Contact, IsometricaUser) {
	isa.AbstractRemoteService.call(this, Contact);
	this.IsometricaUser = IsometricaUser;
};

_ContactServiceRemote.$inject = [ 'Contact', 'IsometricaUser' ];
_ContactServiceRemote.prototype = Object.create(isa.AbstractRemoteService.prototype);

/**
 * Finds all the contacts associated with a given user.
 *
 * @param	user	Object
 * @return 	Promise
 */
_ContactServiceRemote.prototype.allForUser = function(user) {
	return this.IsometricaUser.callTreeContacts({
		id: user.id
	}).$promise;
};

app.service('_ContactServiceRemote', _ContactServiceRemote);
app.service('_ContactServiceLocal', function() {});
isa.persistentService(app, 'ContactService');
