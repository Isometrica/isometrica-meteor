var app = angular.module('isa.workinbox');

app.controller('WorkInboxController', function ($scope, $state, $location, filter, inboxItems, currentUser, actionsService) {

  var vm = this;
  var selectFirst = !$state.params.actionId;

  vm.filterStates = [
    { filter: 'all', name: 'All items' },
    { filter: 'open', name: 'Open items' },
    { filter: 'overdue', name: 'Overdue items' },
    { filter: 'type', name: 'By type' },
    { filter: 'owner', name: 'By coworkers' }
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
    var actions = Actions.find({inTrash: false}, {sort:[['targetDate', 'asc']]}).fetch();
    vm.actions.length = 0;
    Array.prototype.push.apply(vm.actions, _.filter(actions, filterFn));
    makeGroups();
    if (selectFirst && vm.actions.length) {
      $state.go('.action', {filter: filter, type: vm.actions[0].type, actionId:vm.actions[0]._id});
    }
  });



  vm.deleteAll = function() {
  	vm.inboxItems.remove();
  	$state.go('workinbox');
  };

  function filterFn(value, index, array) {
    if (vm.filter === 'owner') {
      return true;
    }
    if (value.owner._id !== currentUser._id) {
      return false;
    }

    switch (vm.filter) {
      case 'all': return true;
      case 'open': return value.status && value.status.value === 'open';
      case 'overdue': return value.targetDate && moment(value.targetDate).isBefore(new Date());
      case 'type': return true;
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
