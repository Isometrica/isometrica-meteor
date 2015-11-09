var app = angular.module('isa');

app.directive('isaAskQuestion', function($rootScope, growl){
	
	return {
		restrict: 'AE',
		templateUrl: 'client/guidanceBar/askQuestion.ng.html',
		link: function(scope, iElm, iAttrs, controller) {

			scope.model = { question: '' };

			scope.askQuestion = function() {

		        if (!scope.model.question || !scope.model.question.length) {
		          growl.warning('Please enter a question');
		        }
		        else {
		        	var textId = '';
		        	if (scope.guidance) {
		        		textId = scope.guidance.textId;
		        	}

		          Meteor.call('askQuestion', $rootScope.currentUser._id, textId, scope.model.question, function(err, res) {
		            if (err) {
		              growl.error(err);
		            }
		            else {
		              growl.success("Your question has been sent to Isometrica");
		              scope.$apply(function() {
		                scope.view.hideQuestion = true;
		                scope.model.question = "";
		              });
		            }
		          });
		        }
		    };
			
		}
	};
});