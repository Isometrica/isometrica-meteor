angular
  .module('isa.dashboard.meetings')
  .directive('isaMeetingStatus', isaMeetingStatusDirective);

function isaMeetingStatusDirective() {
  return function(scope, elem, attr) {
    var optional = false;
    var mtgExpr = attr.isaMeetingStatus;
    if (mtgExpr.startsWith('?')) {
      optional = true;
      mtgExpr = mtgExpr.substring(1);
    }

    var mtg = scope.$eval(mtgExpr);
    if (!mtg) {
      elem.hide();
      return;
    }

    elem.addClass('label');
    elem.addClass('status-indicator');
    if (!mtg.actions || 0 === mtg.actions.length) {
      if (optional) {
        elem.hide();
      }
    }
    else {
      elem.show();
      // TODO: style based on actions
    }
  }
}
