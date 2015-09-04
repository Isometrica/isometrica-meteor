'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookEditUserController', AddressBookEditUserController);

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
function AddressBookEditUserController($scope, $rootScope, $modalInstance, $modal, $controller, $meteor, object, growl) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		collection: angular.noop,
		object: object
	});

	/**
	 * Local user collection.
	 *
	 * @var AngularMeteorCollection
	 */
	var users = $scope.$meteorCollection(Meteor.users, false);

	/**
	 * Local memberships collection.
	 *
	 * @var AngularMeteorCollection
	 */
	var memberships = $scope.$meteorCollection(Memberships, false);

	if ($scope.isNew) {

		/**
		 * New, empty membership !
		 *
		 * @var Object
		 */
		$scope.membership = {};

		/**
		 * Clean so that default and autoValues are populated for
		 * new user object.
		 */
		Schemas.User.clean($scope.object);
		Schemas.Membership.clean($scope.membership);

		/**
		 * @protected
		 * @override
		 */
		$scope.save = function() {
			$scope.loading = true;
			$meteor
				.mtCall('registerOrganisationUser', $scope.object, $scope.membership)
				.then($scope.success, $scope.failure);
		};

	} else {

		/**
		 * Creates a copy of the existing object with key attributes
	 	 * having been rearrange to the appropriate position in the
		 * document.
		 *
		 * @return Object
		 */
		var createPayload = function() {
			var user = angular.copy($scope.object);
			user.emails[0].address = user.email;
			delete user.email;
			return user;
		};

		/**
		 * Existing membership to manipulate.
		 *
		 * @var Object
		 */
		$scope.membership = Memberships.findOne({
			userId: object._id
		});

		var inArr = function(arr) {
			return arr && !!_.find(arr, function(obj) {
				return obj._id === $scope.object._id;
			});
		};

		/**
		 * Local docwiki collection - all documents and the access levels
		 * that the user in question has for them.
		 *
		 * @var AngularMeteorCollection
		 */
		$scope.docs = $scope.$meteorCollection(function() {
			return Modules.find({
				inTrash: false,
				isArchived: false,
				isTemplate: false
			}, {
				transform: function(doc) {
					var permission;
					if (doc.owner._id === $scope.object._id) {
						permission = "Owner";
					} else {
						var accessOverrides = {
							"Reader": doc.allowReadByAll,
							"Editor": doc.allowEditByAll
						};
						console.log('Acess overrides', accessOverrides);
						var accessMap = _.pick({
							"Editor": doc.editors,
							"Reader": doc.readers,
							"Signer": doc.signers,
							"Approver": doc.approvers
						}, function(col, permission) {
							console.log('Pick predicate called', arguments);
							return accessOverrides[permission] || inArr(col);
						});
						var permissions = _.keys(accessMap);
						if (permissions.length === 0) {
							permission = "No Access";
						} else {
							permission = permissions.join(" + ");
						}
					}
					return angular.extend(doc, {
						permission: permission
					});
				}
			});
		}, false).subscribe('modules');

		/**
		 * @protected
		 * @override
		 */
		$scope.save = function() {
			$scope.loading = true;
			var payload = createPayload();
			users.save(payload).then(function() {
				return memberships.save($scope.membership);
			}).then($scope.success, $scope.failure);
		};

		/**
		 * Sends reset password email to the user.
		 */
		$scope.changePassword = function() {
			$scope.loading = true;
			$meteor.call('resetUserPassword', $scope.object._id).then(function() {
				growl.info('A password reset email has been sent to this user.');
				$scope.loading = false;
			}, $scope.failure);
		};

		/**
		 * Transform the object such that the email key exists for editing
		 * directily in the object.
		 *
		 * @see createPayload
		 */
		$scope.object.email = $scope.object.emails[0].address;

	}
}
