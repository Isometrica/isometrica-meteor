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

	if ($scope.isNew) {

		/**
		 * @protected
		 * @override
		 */
		$scope.save = function() {
			$scope.loading = true;
			$meteor
				.mtCall('registerOrganisationUser', $scope.object)
				.then($scope.success, $scope.failure);
		};

	} else {

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
					var permission = function() {
						if (doc.owner._id === $scope.object._id) {
							return "Owner";
						} else if (_.find(doc.editors, function(editor) {
							return editor._id === $scope.object._id;
						})) {
							return "Editor";
						} else {
							return "Reader";
						}
					};
					var ext = angular.extend(doc, {
						permission: permission()
					});
					console.log('Extended doc', ext);
					return ext;
				}
			});
		}, false).subscribe('modules');

		/**
		 * The membership between the user that we're editing and the
		 * current org.
		 *
		 * @var Object
		 */
		$scope.membership = Memberships.findOne({
			userId: object._id
		});

		/**
		 * Creates a copy of the existing object with key attributes
		 * having been rearrange to the appropriate position in the
		 * document.
		 *
		 * @return Object
		 */
		var createPayload = function() {
			var user = angular.copy($scope.object);
			user.emails[0].address = user.profile.email;
			delete user.profile.email;
			return user;
		};

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
		 * in the profile sub doc.
		 *
		 * @see createPayload
		 */
		$scope.object.profile.email = $scope.object.emails[0].address;

	}

}
