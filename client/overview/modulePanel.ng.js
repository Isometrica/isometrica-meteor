'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', function($modal, growl) {
	return {
		template : '<div ng-include="getTemplateUrl()"></div>',
		restrict: 'E',
		scope: {
			modules: '=',
			module: '='
		},
		controller: function($scope) {
			$scope.getTemplateUrl = function() {

				if ($scope.module.type == 'docwiki') {
					if ($scope.module.inTrash) {
						return 'client/overview/panels/docwikiPanelDeleted.ng.html';
					} else if ($scope.module.isArchived) {
						return 'client/overview/panels/docwikiPanelArchived.ng.html';
					} else if ($scope.module.isTemplate) {
						return 'client/overview/panels/docwikiPanelTemplate.ng.html';
					} else {
						return 'client/overview/panels/docwikiPanel.ng.html';
					}
				} else {
					return 'client/overview/' + $scope.module.type + 'Panel.ng.html';
				}
			};

			$scope.getNumPages = function() {
				var c = $scope.module.numPages || 0;
				return c + ( c == 1 ? ' page' : ' pages');
			};

			$scope.undelete = function() {
				//restore a deleted module

				Modules.update( { _id : $scope.module._id}, {$set : {inTrash : false}}, function(err, res) {
					growl.success('The selected document has been restored');
				});
			
			};

			$scope.restore = function() {
				//restore an archived module

				Modules.update( { _id : $scope.module._id}, {$set : {isArchived : false}}, function(err, res) {
					growl.success('The document has been restored ');
				});

			};

		}
	
	};
});


