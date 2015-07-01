'use strict';

/**
 * @author Steve Fortune
 */
var app = angular.module('isa.addressbook');
var _UserServiceRemote = function(IsometricaUser, Organisation, CurrentOrgId) {
	isa.AbstractRemoteService.call(this, IsometricaUser);
	this.Organisation = Organisation;
	this.CurrentOrgId = CurrentOrgId;
};

_UserServiceRemote.$inject = [ 'IsometricaUser', 'Organisation', 'CurrentOrgId' ];
_UserServiceRemote.prototype = Object.create(isa.AbstractRemoteService.prototype);

/**
 * Finds all users in the organisation of the current module
 *
 * @param	org		Object
 * @param 	offset	Number
 */
_UserServiceRemote.prototype.all = function(offset) {
	var self = this;
	return self.Organisation.users({
		id: self.CurrentOrgId.orgId,
		filter: {
			offset: offset,
			order: "created DESC",
			limit: self.pageSize
		}
	}).$promise;
};

/**
 * Finds a specific user in an organisation.
 *
 * @param	org		Object
 * @param 	offset	Number
 */
_UserServiceRemote.prototype.findById = function(id) {
	var self = this;
	return self.Organisation.users.findById({
		id: self.CurrentOrgId.orgId,
		fk: id
	}).$promise;
};

/**
 * Updates a user by id.
 *
 * @param	id		Number
 * @param 	user	Object
 */
_UserServiceRemote.prototype.updateById = function(id, user) {
	var self = this;
	return self.Organisation.users.updateById({
		id: self.CurrentOrgId.orgId,
		fk: id
	}, user).$promise;
};

/**
 * Does an email address exist?
 *
 * @param	email	String
 * @param 	return 	Promise
 */
_UserServiceRemote.prototype.emailExists = function(email) {
	return this.lbModel.emailExists({
		email: email
	}).$promise.then(function(res) {
		return res.exists;
	});
};

/**
 * Inserts users in the given organisation.
 *
 * @param	org		Object
 * @param 	offset	Number
 */
_UserServiceRemote.prototype.insert = function(user) {
	var self = this;
	return this.Organisation.users.create({
		id: self.CurrentOrgId.orgId
	}, user).$promise;
};

app.service('_UserServiceRemote', _UserServiceRemote);
app.service('_UserServiceLocal', function() {});
isa.persistentService(app, 'UserService');
