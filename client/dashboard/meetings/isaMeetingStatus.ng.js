angular
  .module('isa.dashboard.meetings')
  .directive('isaMeetingStatus', isaMeetingStatusDirective);

function isaMeetingStatusDirective(MeetingsService) {
  return function(scope, elem, attr) {
    var optional = false;
    var mtgExpr = attr.isaMeetingStatus;
    if (mtgExpr.indexOf('?') === 0) {
      optional = true;
      mtgExpr = mtgExpr.substring(1);
    }

    var mtg = scope.$eval(mtgExpr);
    if (!mtg) {
      elem.hide();
      return;
    }

    var type = attr.type || 'circle';

    elem.addClass('label');
    if ('circle' === type) {
      elem.addClass('status-indicator');
    }

    computeStatus();

    scope.$meteorAutorun(computeStatus);

    function computeStatus() {
      if (mtg.inTrash) {
        elem.hide();
        return;
      }
      else {
        elem.show();
      }

      var actions = Actions.find({'meeting.meetingId': mtg._id, inTrash: false}).fetch() || [];
      actions = actions.concat(MeetingsService.findPreviousMeetingActions(mtg));
      if (0 === actions.length) {
        if (optional) {
          elem.hide();
        }
      }
      else {
        elem.show();
        var state = 0;
        var openCount = 0;
        var overdueCount = 0;
        _.each(actions, function(action) {
          if (!action.status) {
            return;
          }

          if ((action.status.value == 'open' || action.status.value == 'needsPlan') && moment(action.targetDate).isBefore(new Date())) {
            state = 2;
            ++overdueCount;
          }
          else if ((action.status.value == 'open' || action.status.value == 'needsPlan') && state < 2) {
            state = 1;
            ++openCount;
          }
        });

        elem.removeClass('label-success label-warning label-danger');
        elem.addClass(['label-success', 'label-warning', 'label-danger'][state]);
        if ('label' === type) {
          var html = null;
          switch (state) {
            case 0:
              html = 'No open actions';
              break;
            case 1:
              html = openCount + ' open action';
              if (openCount > 1) {
                html += 's';
              }
              break;
            case 2:
              html = overdueCount + ' overdue action';
              if (overdueCount > 1) {
                html += 's';
              }
              break;
          }
          elem.html(html);
        }
      }
    }
  }
}
