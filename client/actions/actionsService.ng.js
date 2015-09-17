angular
  .module('isa.actions')
  .service('actionsService', actionsService);

function actionsService($meteor, $q, $rootScope) {
  return {
    actionCount: actionCount,
    allActions: allActions,
    actionTypeNames: {
      'meeting': 'Meeting Actions'
    }
  };

  function actionCount(scope) {
    var answer = {
      myActions: 0,
      myOpenActions: 0,
      allActions: 0
    };

    scope.$meteorSubscribe('notifications');
    scope.$meteorSubscribe('actions');

    scope.$meteorAutorun(function() {
      var currentUser = scope.$root.getReactively('currentUser');
      var userId = currentUser ? currentUser._id : null;

      answer.myOpenActions = Actions.find({'owner._id': userId, 'status.value': 'open' }).count();
      answer.myActions = Actions.find({'owner._id': userId}).count();
      answer.myActions += Notifications.find({ownerId: userId}).count();
    });

    return answer;
  }

  function allActions() {
    var answer = $meteor.collection(function() {
      return Actions.find({inTrash: false});
    }, false);

    answer.$unsubscribe = angular.noop;

    var defer = $q.defer();
    answer.$ready = defer.promise;

    $meteor
      .subscribe('actions')
      .then(function(subHandle) {
        answer.$unsubscribe = subHandle.stop;
        defer.resolve(answer);
      }, function(err) {
        defer.reject(err);
      });

    return answer;
  }
}
