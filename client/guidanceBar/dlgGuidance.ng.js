angular
  .module('isa')
  .directive('dlgGuidance', dlgGuidanceDirective)
  .directive('dlgGuidanceButton', dlgGuidanceButtonDirective)
  .directive('dlgGuidanceView', dlgGuidanceViewDirective);

function dlgGuidanceDirective() {
  return {
    restrict: 'A',
    controller: GuidanceController,
    require: 'dlgGuidance',
    link: function(scope, elem, attr, dlgGuidanceCtrl) {
      attr.$observe('dlgGuidance', function(newVal) {
        dlgGuidanceCtrl.setGuidanceId(newVal);
      });
    }
  };

  function GuidanceController($scope, $rootScope, $log) {
    var ctrl = this;

    ctrl.setGuidanceId = function(guidanceId) {
      $scope.guidanceId = guidanceId;
      if (!guidanceId) {
        $log.warn("Missing guidance identifier");
        $scope.guidanceHide = true;
      }
      else {
        ctrl.guidance = SystemTexts.findOne({textId: guidanceId});
        if (!ctrl.guidance) {
          $log.warn("Missing guidance for " + guidanceId);
          ctrl.guidance = { subject: 'Missing guidance: ' + guidanceId };
        }
        $scope.guidanceHide = -1 !== _.indexOf($rootScope.currentUser.profile.hiddenGuidance, guidanceId);
      }
    };

    ctrl.hideGuidance = function() {
      if (!ctrl.guidance.textId) {
        // Don't allow hiding missing guidance
        return;
      }

      Meteor.users.update($rootScope.currentUser._id, {$addToSet: {'profile.hiddenGuidance': $scope.guidanceId }});
      $scope.guidanceHide = true;
    };

    ctrl.toggleVisibility = function() {
      $scope.guidanceHide = !$scope.guidanceHide;
    };
  }
}

function dlgGuidanceButtonDirective() {
  return {
    restrict: 'E',
    template: '<button type="button" class="btn btn-link guidance-toggle"><i class="fa fa-lg fa-question-circle"></i></button>',
    replace: true,
    require: '^dlgGuidance',
    link: function(scope, elem, attr, dlgGuidanceCtrl) {
      scope.$watch('guidanceHide', function(guidanceHide) {
        if (!!guidanceHide) {
          elem.show();
        }
        else {
          elem.hide();
        }
      });
      elem.click(function() {
        dlgGuidanceCtrl.toggleVisibility();
      })
    }
  }
}

function dlgGuidanceViewDirective() {
  return {
    restrict: 'E',
    templateUrl: 'client/guidanceBar/dlgGuidanceView.ng.html',
    require: '^dlgGuidance',
    scope: true,
    link: function(scope, elem, attr, dlgGuidanceCtrl) {
      scope.view = { showMore: false, showQuestion: false };

      var panelElem = angular.element(elem.children()[0]);

      scope.$watch('guidanceId', function() {
        scope.guidance = dlgGuidanceCtrl.guidance;
      });

      scope.$watch('guidanceHide', function(guidanceHide) {
        if (guidanceHide) {
          panelElem.removeClass('in').addClass('collapsed');
        }
        else {
          panelElem.removeClass('collapsed').addClass('in');
        }
      });

      scope.hideGuidance = function() {
        dlgGuidanceCtrl.hideGuidance();
      };
    }
  }

}
