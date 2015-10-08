var app = angular.module('isa.admin');

/*
 * Manage system texts collection
 */
app.controller('SystemTextsCtrl', function($scope, $modal) {

	var vm = this;
	vm.texts = $scope.$meteorCollection(SystemTexts, false);

	vm.editText = function(text) {

		var modalInstance = $scope.modalInstance = $modal.open({
			templateUrl: 'client/admin/systemTexts/edit.ng.html',
			controller: 'EditSystemTextCtrl',
			controllerAs : 'vm',
			backdrop : 'static',
			resolve: {
				text : function () {
					return angular.copy(text);
				},
			}
		});

		modalInstance.result.then(function (data){

			if (data.reason=='save') {
				vm.texts.save( data.text );
			}
	    }, function () {

	    });
	};

});

app.controller('EditSystemTextCtrl', function($scope, $modalInstance, text) {

	var vm = this;
	vm.text = text;

	vm.save = function() {
		$modalInstance.close( { reason : 'save', text : vm.text });
	};

	vm.cancel = function() {
		$modalInstance.dismiss();
	}

});
