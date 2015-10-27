angular
  .module('isa.dashboard.components')
  .controller('IsaSubcardController', isaSubcardController)
  .directive('isaSubcard', isaSubcardDirective)
  .directive('isaSubcardIndicator', isaSubcardIndicatorDirective)
  .directive('isaSubcardIndicatorText', isaSubcardIndicatorTextDirective)
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
    require: ['isaSubcard', '?^^isaSubcard'],
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'client/dashboard/components/subCard.ng.html';
    },
    link: function(scope, element, attrs, ctrls) {
      var isaSubcardCtrl = ctrls[0];
      attrs.$observe('title', function(val) {
        isaSubcardCtrl.title = val;
      });

      var parent = angular.element(element.parent());
      if (parent.hasClass('full-width')) {
        if (ctrls[1]) {
          parent.removeClass('full-width');
        }
        else {
          angular.element(element.children()[0]).addClass('panel-white');
        }
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

function isaSubcardIndicatorTextDirective($compile) {
  return {
    template: '',
    replace: true,
    require: '^isaSubcard',
    link: function(scope, element, attrs, isaSubcardCtrl) {
      attrs.$observe('indicator', function(indicatorVal) {
        scope.indicatorVal = indicatorVal;
      });

      var html = '<h4 class="panel-title pull-right text-muted" ng-bind="indicatorVal"></h4>';
      var elem = $compile(html)(scope);
      isaSubcardCtrl.setIndicator(elem);

    }
  }
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
