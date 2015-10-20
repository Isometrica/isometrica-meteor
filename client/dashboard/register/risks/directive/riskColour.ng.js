angular
  .module('isa.dashboard.risks')
  .directive('isaRiskColour', isaRiskColour);

function isaRiskColour() {
  return {
    link: function(scope, elm, attrs) {
      var currentClass, scoreMap = {
        vlow: [15, 1, 8, 12, 16, 20],
        low: [45, 35, 26, 25, 30, 36, 42],
        medium: [65, 60, 51, 54, 59, 66],
        high: [91, 75, 80, 85, 95, 100]
      };
      var classForScore = function(score) {
        /// @note _.findKey doesn't seem to be available in this vn of
        /// _
        return 'impact-' + _.select(_.keys(scoreMap), function(key) {
          return ~scoreMap[key].indexOf(score);
        });
      };
      scope.$watch(function() { return scope.score; }, function(newScore, oldScore) {
        elm.removeClass(classForScore(oldScore));
        elm.addClass(classForScore(newScore));
      });
    },
    scope: {
      score: '='
    }
  }
}
