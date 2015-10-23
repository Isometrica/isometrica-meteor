angular
  .module('isa.dashboard.components')
  .controller('IsaSubcardController', isaSubcardController)
  .directive('isaSubcard', isaSubcardDirective)
  .directive('isaSubcardIndicator', isaSubcardIndicatorDirective)
  .directive('isaSubcardBody', isaSubcardBodyDirective)
  .directive('isaSubcardTransclude', isaSubcardTranscludeDirective);

function isaSubcardController() {
  var subcard = this;
  subcard.isCollapsed = true;

  subcard.setIndicator = function(indicator) {
    subcard.indicator = indicator;
  };

  subcard.setBody = function(body) {
    subcard.body = body;
  }
}

function isaSubcardDirective() {
  return {
    controller: 'IsaSubcardController',
    controllerAs: 'subcard',
    transclude: 'true',
    require: 'isaSubcard',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'client/dashboard/components/subCard.ng.html';
    },
    link: function(scope, element, attrs, isaSubcardCtrl) {
      attrs.$observe('title', function(val) {
        isaSubcardCtrl.title = val;
      });

      if (angular.element(element.parent()).hasClass('full-width')) {
        angular.element(element.children()[0]).addClass('panel-white');
      }
    }
  }
}

function isaSubcardIndicatorDirective() {
  return {
    transclude: true,
    template: '',
    replace: true,
    require: '^isaSubcard',
    link: function(scope, element, attrs, isaSubcardCtrl, transclude) {
      isaSubcardCtrl.setIndicator(transclude(scope, angular.noop));
    }
  };
}

function isaSubcardBodyDirective($log) {
  return {
    transclude: true,
    template: '<div ng-if="!subcard.isCollapsed" ng-transclude></div>',
    //replace: true,
    require: '^isaSubcard'
  };
}

function isaSubcardTranscludeDirective() {
  return {
    require: '^isaSubcard',
    link: function(scope, element, attrs, isaSubcardCtrl) {
      scope.$watch(function() {
        return isaSubcardCtrl[attrs.isaSubcardTransclude];
      }, function(contents) {
        if (contents) {
          element.html('');
          element.append(contents);
        }
      });
    }
  }
}
