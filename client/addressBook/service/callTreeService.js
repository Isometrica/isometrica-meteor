'use strict';

/**
 * @author Steve Fortune
 */
var app = angular.module('isa.addressbook');
var _CallTreeServiceRemote = function(CallTreeNode, Identity) {
	this.Identity = Identity;
	this.CallTreeNode = CallTreeNode;
};

_CallTreeServiceRemote.$inject = [ 'CallTreeNode', 'Identity' ];

/**
 * All nodes in the current user's call tree.
 *
 * @param	offset		Number
 * @return  Promise
 */
_CallTreeServiceRemote.prototype.all = function(offset) {
    var self = this;
	return self.Identity.get().then(function(user) {
		return self.findTree(user, offset);
	});
};

/**
 * Search for contacts and users to add to the call tree.
 *
 * @param	org		Object
 * @param	search	String
 */
_CallTreeServiceRemote.prototype.searchNodes = function(search) {
    var self = this;
    return self.CallTreeNode.searchNodes({
        search: search
    }).$promise;
};

/**
 * Finds all users _not_ in the given user's call tree
 *
 * @param	owner	Object
 * @param	offset	Number
 * @return	Promise
 */
_CallTreeServiceRemote.prototype.findReverseTree = function(owner, offset) {
	var self = this;
	return self.CallTreeNode.findReverse({
		ownerId: owner.id
	}).$promise;
};

/**
 * Finds call tree nodes for a given parent
 *
 * @param	owner	Object
 * @param	offset	Number
 */
_CallTreeServiceRemote.prototype.findTree = function(owner, offset) {
    var self = this;
    return self.CallTreeNode.find({
		filter: {
			offset: offset,
			where: {
				ownerId: owner.id
			}
		}
    }).$promise;
};

/**
 * Add a child to one's call tree.
 *
 * @param	owner		    Object
 * @param	child   		Object
 */
_CallTreeServiceRemote.prototype.add = function(owner, child) {
    var self = this;
	var proposition = {
		ownerId: owner.id
	};
	proposition[child.type + 'Id'] = child.id;
    return self.CallTreeNode.create(proposition).$promise;
};

/**
 * Delete a node from one's call tree.
 *
 * @param	node   		    Object
 */
_CallTreeServiceRemote.prototype.delete = function(node) {
    var self = this;
    return self.CallTreeNode.destroyById({
        id: node.id
    }).$promise;
};

app.service('_CallTreeServiceRemote', _CallTreeServiceRemote);
app.service('_CallTreeServiceLocal', function() {});
isa.persistentService(app, 'CallTreeService');
