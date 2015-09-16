var app = angular.module('isa.workinbox');

app.controller('WorkInboxController', function ($scope, $state, $location, filter, inboxItems, currentUser, actionsService) {

  var vm = this;
  var selectFirst = !$state.params.actionId;

  vm.filterStates = [
    { filter: 'all', name: 'All open items' },
    { filter: 'overdue', name: 'Overdue items' },
    { filter: 'type', name: 'By type' },
    { filter: 'owner', name: 'By coworkers' },
    { filter: 'closed', name: 'Closed items' },
    { filter: 'canceled', name: 'Canceled items' }
  ];
  vm.switchFilter = function (newFilter) {
    $location.search('filter', newFilter.filter);
  };

  vm.currentUser = currentUser;
  vm.filter = filter;

  if (vm.filter === 'type') {
    vm.groupBy = 'type';
  }
  else if (vm.filter === 'owner') {
    vm.groupBy = 'owner.fullName';
  }

  vm.inboxItems = inboxItems;
  vm.actions = [];

  $scope.$meteorSubscribe('actions');

  $scope.$meteorAutorun(function() {
    var actions = Actions.find({inTrash: false}, {sort:[['created.at', 'desc']]}).fetch();
    vm.actions.length = 0;
    Array.prototype.push.apply(vm.actions, _.filter(actions, filterFn));
    makeGroups();
    if (selectFirst && vm.actions.length) {
      $state.go('.action', {type: vm.actions[0].type, actionId:vm.actions[0]._id});
    }
    else if ($state.params.actionId && vm.actions.length && !_.findWhere(vm.actions, {_id: $state.params.actionId })) {
      $state.go('.', {type: vm.actions[0].type, actionId:vm.actions[0]._id});
    }
  });



  vm.deleteAll = function() {
  	vm.inboxItems.remove();
  	$state.go('workinbox');
  };

  function filterFn(action) {
    var isOpen = action.status && action.status.value === 'open';
    if (vm.filter === 'owner') {
      return isOpen;
    }
    if (action.owner._id !== currentUser._id) {
      return false;
    }

    switch (vm.filter) {
      case 'all': return isOpen;
      case 'overdue': return action.status.value === 'open' && action.targetDate && moment(action.targetDate).isBefore(new Date());
      case 'type': return isOpen;
      case 'closed': return action.status.value === 'closed';
      case 'canceled': return action.status.value === 'canceled';
      default: return true;
    }
  }

  function makeGroups() {
    if (vm.filter !== 'type' && vm.filter !== 'owner') {
      vm.groups = undefined;
      return;
    }

    var groups = _.groupBy(vm.actions, function(item) {
      switch (vm.filter) {
        case 'type': return actionsService.actionTypeNames[item.type] || item.type;
        case 'owner': return item.owner.fullName;
      }
    });

    vm.groups = vm.groups || [];
    _.forEach(vm.groups, function(group) {
      group.actions.length = 0;
      if (groups.hasOwnProperty(group.name)) {
        Array.prototype.push.apply(group.actions, groups[group.name]);
        delete groups[group.name];
      }
    });

    _.forEach(groups, function(group, name) {
      vm.groups.push({ name: name, isCollapsed: true, actions: group });
    });
  }
});
