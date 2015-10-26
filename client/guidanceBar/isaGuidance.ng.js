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
          ctrl.guidance = { subject: 'Missing guidance: ' + guidanceId, textId: guidanceId };
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
      else if (tAttr.type === 'bar') {
        return '<a class="btn btn-link guidance-toggle icon-only"><i class="fa fa-lg fa-question-circle"></i></a>';
      }
      return '<button type="button" class="btn btn-link guidance-toggle"><i class="fa fa-lg fa-question-circle"></i></button>';
    },
    replace: true,
    require: '?^isaGuidance',
    link: function(scope, elem, attr, isaGuidanceCtrl) {
      if (!isaGuidanceCtrl) {
        elem.hide();
        return;
      }

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

function isaGuidanceViewDirective($rootScope, growl) {
  return {
    restrict: 'E',
    templateUrl: 'client/guidanceBar/isaGuidanceView.ng.html',
    require: '?^isaGuidance',
    scope: true,
    link: function(scope, elem, attr, isaGuidanceCtrl) {
      if (!isaGuidanceCtrl) {
        elem.hide();
        return;
      }

      var isPage = attr.type === 'page' || attr.type === 'bar';
      scope.view = {
        hideGuidance: true,
        hideMore: true,
        hideQuestion: true,
        showBlueBar: isPage,
        hideEdit: true,
        hideOptions: false,
        allowEdit: $rootScope.isSysAdmin
      };
      scope.model = { question: '' };

      attr.$observe('hideBlueBar', function(val) {
        scope.view.showBlueBar = scope.isPageGuidance() && val == true;
      });

      //ML: temporary attribute on the guidance view to hide the option buttons on a guidance bar
      //can be removed if the new flexbox based design is implemented
      attr.$observe('hideOptions', function(val) {
        scope.view.hideOptions = (val == 'true');
      });

      scope.$watch('guidanceId', function() {
        scope.guidance = isaGuidanceCtrl.guidance;
      });

      scope.$watch(function() {
        return isaGuidanceCtrl.guidanceHide;
      }, function(guidanceHide) {
        scope.view.hideGuidance = guidanceHide;
      });

      scope.askQuestion = function() {
        if (!scope.model.question || !scope.model.question.length) {
          growl.warning('Please enter a question');
        }
        else {
          Meteor.call('askQuestion', $rootScope.currentUser._id, scope.guidance.textId, scope.model.question, function(err, res) {
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

      scope.hideGuidance = function() {
        isaGuidanceCtrl.hideGuidance();
        scope.view.hideMore = true;
        scope.view.hideQuestion = true;
      };

      scope.isPageGuidance = function() {
        return isPage;
      };

      scope.editGuidance = function() {
        scope.view.saveGuidance = angular.copy(scope.guidance);
        scope.view.hideEdit = false;
      };

      scope.cancelEdit = function() {
        angular.extend(scope.guidance, scope.view.saveGuidance);
        scope.view.hideEdit = true;
      };

      scope.saveChanges = function() {
        function saveCallback(err) {
          if (err) {
            growl.error('Error saving guidance: ' + err);
          }
          else {
            angular.extend(scope.view.saveGuidance, scope.guidance);
            growl.info('Guidance saved');
            scope.cancelEdit();
          }
        }

        if (scope.guidance._id) {
          SystemTexts.update(scope.guidance._id, {
            $set: {
              subject: scope.guidance.subject,
              contents: scope.guidance.contents,
              helpUrl: scope.guidance.helpUrl
            }
          }, saveCallback)
        }
        else {
          SystemTexts.insert(scope.guidance, saveCallback);
        }
      }
    }
  }

}
