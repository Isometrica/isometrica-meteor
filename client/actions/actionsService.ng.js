angular
  .module('isa.actions')
  .service('actionsService', actionsService);

function actionsService() {
  return {
    actionCount: actionCount
  };

  function actionCount(scope) {
    var answer = {
      myActions: 0,
      allActions: 0
    };

    scope.$meteorSubscribe('notifications');
    scope.$meteorSubscribe('meeting-actions');

    scope.$meteorAutorun(function() {
      var currentUser = scope.$root.getReactively('currentUser');
      var userId = currentUser ? currentUser._id : null;

      answer.myActions = MeetingActions.find({'owner._id': userId}).count();
      answer.myActions += Notifications.find({ownerId: userId}).count();
    });

    return answer;
  }
}
