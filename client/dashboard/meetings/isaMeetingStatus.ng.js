angular
  .module('isa.dashboard.meetings')
  .directive('isaMeetingStatus', isaMeetingStatusDirective);

function isaMeetingStatusDirective() {
  return function(scope, elem, attr) {
    var mtg = scope.$eval(attr.isaMeetingStatus);
    if (!mtg) {
      return;
    }

    elem.addClass('label');
    elem.addClass('status-indicator');
    if (!mtg.actions) {
      elem.addClass('label-success');
    }
    else {

    }
  }
}
