angular
  .module('isa.actions')
  .service('actionsService', actionsService);

function actionsService($meteor, $q, $rootScope) {
  return {
    actionCount: actionCount,
    userActions: userActions
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

  function userActions() {
    var currentUser = $rootScope.getReactively('currentUser');
    var userId = currentUser ? currentUser._id : null;

    var answer = $meteor.collection(function() {
      return MeetingActions.find({'owner._id': userId});
    }, false);

    answer.$unsubscribe = angular.noop;

    var defer = $q.defer();
    answer.$ready = defer.promise;

    $meteor
      .subscribe('meeting-actions')
      .then(function(subHandle) {
        answer.$unsubscribe = subHandle.stop;
        defer.resolve(answer);
      }, function(err) {
        defer.reject(err);
      });

    return answer;
  }
}
