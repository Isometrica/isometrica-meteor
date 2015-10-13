angular
  .module('isa')
  .directive('isaGuidance', isaGuidanceDirective)
  .directive('isaGuidanceButton', isaGuidanceButtonDirective)
  .directive('isaGuidanceView', isaGuidanceViewDirective);

function isaGuidanceDirective() {
  return {
    restrict: 'A',
    controller: IsaGuidanceController,
    require: 'isaGuidance',
    link: function(scope, elem, attr, isaGuidanceCtrl) {
      attr.$observe('isaGuidance', function(newVal) {
        isaGuidanceCtrl.setGuidanceId(newVal);
      });
    }
  };

  function IsaGuidanceController($scope, $rootScope, $log) {
    var ctrl = this;

    ctrl.setGuidanceId = function(guidanceId) {
      $scope.guidanceId = guidanceId;
      if (!guidanceId) {
        $log.warn("Missing guidance identifier");
        ctrl.guidanceHide = true;
      }
      else {
        ctrl.guidance = SystemTexts.findOne({textId: guidanceId});
        if (!ctrl.guidance) {
          $log.warn("Missing guidance for " + guidanceId);
          ctrl.guidance = { subject: 'Missing guidance: ' + guidanceId };
        }
        ctrl.guidanceHide = -1 !== _.indexOf($rootScope.currentUser.profile.hiddenGuidance, guidanceId);
      }
    };

    ctrl.hideGuidance = function() {
      Meteor.users.update($rootScope.currentUser._id, {$addToSet: {'profile.hiddenGuidance': $scope.guidanceId }});
      ctrl.guidanceHide = true;
    };

    ctrl.showGuidance = function() {
      Meteor.users.update($rootScope.currentUser._id, {$pull: {'profile.hiddenGuidance': $scope.guidanceId }});
      ctrl.guidanceHide = false;
    };
  }
}

function isaGuidanceButtonDirective() {
  return {
    restrict: 'E',
    template: function(tElem, tAttr) {
      if (tAttr.type === 'page') {
        return '<a class="guidance-toggle"><i class="fa fa-fw fa-question-circle"></i> Help</a>';
      }
      return '<button type="button" class="btn btn-link guidance-toggle"><i class="fa fa-lg fa-question-circle"></i></button>';
    },
    replace: true,
    require: '^isaGuidance',
    link: function(scope, elem, attr, isaGuidanceCtrl) {
      scope.$watch(function() {
        return isaGuidanceCtrl.guidanceHide;
      }, function(guidanceHide) {
        if (!!guidanceHide) {
          elem.addClass('collapsed');
        }
        else {
          elem.removeClass('collapsed');
        }
      });
      elem.click(function() {
        isaGuidanceCtrl.showGuidance();
      })
    }
  }
}

function isaGuidanceViewDirective() {
  return {
    restrict: 'E',
    templateUrl: 'client/guidanceBar/isaGuidanceView.ng.html',
    require: '^isaGuidance',
    scope: true,
    link: function(scope, elem, attr, isaGuidanceCtrl) {
      scope.view = { hideGuidance: true, hideMore: true, hideQuestion: true, showBlueBar: attr.type === 'page' };
      attr.$observe('hideBlueBar', function(val) {
        scope.view.showBlueBar = scope.isPageGuidance() && val == true;
      });

      scope.$watch('guidanceId', function() {
        scope.guidance = isaGuidanceCtrl.guidance;
      });

      scope.$watch(function() {
        return isaGuidanceCtrl.guidanceHide;
      }, function(guidanceHide) {
        scope.view.hideGuidance = guidanceHide;
      });

      scope.hideGuidance = function() {
        isaGuidanceCtrl.hideGuidance();
        scope.view.hideMore = true;
        scope.view.hideQuestion = true;
      };
      scope.isPageGuidance = function() {
        return attr.type === 'page';
      }
    }
  }

}
