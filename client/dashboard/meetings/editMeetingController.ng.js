angular
  .module('isa.dashboard.meetings')
  .controller('EditMeetingController', editMeetingController)
  .filter('statusFilter', statusFilter);

function statusFilter() {
  function applies(item, status) {
    if (!item) {
      return false;
    }

    if (angular.isArray(status)) {
      return -1 !== _.indexOf(status, item.status.value);
    }

    return item.status.value === status;
  }

  return function(data, arg) {
    if (!angular.isArray(data)) {
      if (angular.isObject(data)) {
        return applies(data, arg) ? data : undefined;
      }

      return data;
    }

    var answer = _.filter(data, function(item) { return applies(item, arg)});
    return answer;
  }
}

function editMeetingController(meeting, attendees, agendaItems, actionItems, prevActionItems, MeetingsService, $q, $modalInstance, growl, $scope) {
  var vm = this;

  vm.meeting = angular.copy(meeting || {});
  vm.attendees = attendees;
  vm.agendaItems = agendaItems;
  vm.prevActionItems = prevActionItems;
  vm.actionItems = actionItems;
  vm.isNew = !vm.meeting.hasOwnProperty('_id');

  vm.configureMeetingType = function(fields) {
    if (vm.isNew) {
      fields[0].templateOptions.onChange = onMeetingTypeChanged;
      fields[0].templateOptions.onSelected = onMeetingTypeChanged;
    }
    else {
      fields[0].templateOptions.disabled = true;
    }
  };

  vm.cancel = cancelDialog;
  vm.save = saveMeeting;
  vm.delete = deleteMeeting;
  vm.saveSubItem = saveSubItem;

  vm.attOpen = [];
  vm.addAttendee = addAttendee;
  vm.createAttendee = createAttendee;
  vm.deleteAttendee = deleteAttendee;

  vm.aiOpen = [];
  vm.addAgendaItem = addAgendaItem;
  vm.createAgendaItem = createAgendaItem;
  vm.deleteAgendaItem = deleteAgendaItem;

  vm.maOpen = { open: [], closed: [], added: [] };
  vm.addMeetingAction = addMeetingAction;
  vm.createMeetingAction = createMeetingAction;
  vm.deleteMeetingAction = deleteMeetingAction;

  var otherAgendaItems = {};
  vm.agendaItemsFrom = function(mtgId) {
    if (otherAgendaItems.hasOwnProperty(mtgId)) {
      return otherAgendaItems[mtgId];
    }
    return otherAgendaItems[mtgId] = AgendaItems.find({meetingId: mtgId, inTrash: false}).fetch();
  };

  function onMeetingTypeChanged() {
    fetchMeetingItems();
  }

  function fetchMeetingItems() {
    MeetingsService.fetchPreviousMeetingItems(vm.meeting.type)
      .then(function(items) {
        vm.attendees = items.attendees;
        vm.agendaItems = items.agendaItems;
      });
  }

  function cancelDialog() {
    $modalInstance.dismiss('cancel');
  }

  function deleteMeeting() {
    if (vm.meeting._id) {
      Meetings.update(vm.meeting._id, { $set: { inTrash: true }});
      $scope.$root.$broadcast('isaMeetingSaved', vm.meeting._id);
      $modalInstance.close({reason:'delete', meetingId:vm.meeting._id});
    }
  }

  function saveMeeting(form) {
    if (!form.$valid) {
      growl.error('Invalid meeting, please fix errors before saving');
      return;
    }

    if (vm.attendees.length < 2) {
      growl.error('A meeting must include at least 2 attendees');
      return;
    }

    if (!vm.meeting._id) {
      saveNewMeeting(form);
    }
    else {
      updateMeeting(form.$getSchemaOps(), form);
    }
  }

  function postMeetingSave(err, form) {
    if (err) {
      growl.error(err);
    }
    else {
      var promises = [];
      _.each(form.$$schemaCtrl.$childSchemas, function(schemaCtrl) { saveChild(schemaCtrl, promises) });
      $q.all(promises)
        .then(function() {
          $scope.$root.$broadcast('isaMeetingSaved', vm.meeting._id);
          $modalInstance.close({reason: 'save', meetingId: vm.meeting._id});
        }, function(err) {
          growl.error(err);
        })
    }
  }

  function saveNewMeeting(form) {
    Meetings.insert(vm.meeting, function(err, newId) {
      if (!err) {
        vm.meeting._id = newId;
        if (vm.createNewType) {
          MeetingsService.addMeetingType(vm.meeting.type);
        }
      }
      postMeetingSave(err, form);
    });
  }

  function updateMeeting(ops, form) {
    if (null != ops) {
      Meetings.update(vm.meeting._id, form.$getSchemaOps(), function(err) { postMeetingSave(err, form) });
    }
    else {
      postMeetingSave(null, form);
    }
  }

  function saveSubItem(form, openArray, index) {
    if (!vm.meeting._id) {
      // Can't save items until the meeting itself is saved
      openArray[index] = false;
      return;
    }

    var promises = [];
    saveChild(form.$$schemaCtrl, promises);
    $q.all(promises)
      .then(function() {
        openArray[index] = false;
      },
      function(err) {
        growl.error(err);
      });
  }

  function saveChild(schemaCtrl, promises) {
    var doc = schemaCtrl.$schemaDoc;

    if (doc._id && !schemaCtrl.$formCtrl.$dirty) {
      return;
    }

    var defer = $q.defer();
    promises.push(defer.promise);

    function subItemCb(err, result) {
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(result);
      }
    }

    var ops = schemaCtrl.$formCtrl.$getSchemaOps();
    switch (schemaCtrl.$schemaName) {
      case 'Attendees':
        if (!doc._id) {
          doc.meetingId = vm.meeting._id;
          Attendees.insert(angular.copy(doc), subItemCb);
        }
        else {
          Attendees.update(doc._id, ops, subItemCb);
        }
        break;

      case 'AgendaItems':
        if (!doc._id) {
          doc.meetingId = vm.meeting._id;
          AgendaItems.insert(angular.copy(doc), subItemCb);
        }
        else {
          AgendaItems.update(doc._id, ops, subItemCb);
        }
        break;

      case 'Actions':
        if (!doc._id) {
          doc.meeting.meetingId = vm.meeting._id;
          doc.meeting.meetingType = vm.meeting.type;
          var idx = vm.actionItems.indexOf(doc);
          if (-1 != idx) {
            vm.actionItems.splice(idx, 1);
          }
          Actions.insert(angular.copy(doc), subItemCb);
        }
        else {
          Actions.update(doc._id, ops, subItemCb);
        }
        break;
    }

    _.each(schemaCtrl.$childSchemas, function(sub) { saveChild(sub, promises); });
  }

  function addAttendee() {
    vm.newAttendee = { meetingId: vm.meeting._id };
  }

  function createAttendee(attendee, form) {
    if (!form.$valid) {
      return;
    }

    if (vm.isNew) {
      vm.attendees.push(attendee);
      vm.newAttendee = null;
    }
    else {
      vm.attendees.save(attendee).then(function() { vm.newAttendee = null; }, function(err) { growl.error(err); });
    }
  }

  function deleteAttendee(idx) {
    var att = vm.attendees[idx];
    if (att._id) {
      Attendees.update(att._id, {$set: { inTrash: true}});
    }
    else {
      vm.attendees.splice(idx, 1);
    }
    vm.attOpen[idx] = false;
  }

  function addAgendaItem() {
    vm.newAgendaItem = { meetingId: vm.meeting._id, itemNo: vm.agendaItems.length + 1 };
  }

  function createAgendaItem(agenda, form) {
    if (!form.$valid) {
      return;
    }

    if (vm.isNew) {
      vm.agendaItems.push(agenda);
      vm.newAgendaItem = null;
    }
    else {
      vm.agendaItems.save(agenda).then(function() { vm.newAgendaItem = null; }, function(err) { growl.error(err); });
    }
  }

  function deleteAgendaItem(idx) {
    var agenda = vm.agendaItems[idx];
    if (agenda._id) {
      AgendaItems.update(agenda._id, {$set: {inTrash: true}});
    }
    else {
      vm.agendaItems.splice(idx, 1);
    }
    vm.aiOpen[idx] = false;
  }

  function addMeetingAction() {
    vm.newAction = {
      type: 'meeting',
      referenceNumber: '(new)',
      status: {'value': 'open'},
      meeting: {
        meetingId: vm.meeting._id,
        meetingType: vm.meeting.type
      }
    };
  }

  function createMeetingAction(action, form) {
    if (!form.$valid) {
      return;
    }

    if (vm.isNew) {
      vm.actionItems.push(action);
      vm.newAction = null;
    }
    else {
      vm.actionItems.save(action).then(function() { vm.newAction = null; }, function(err) { growl.error(err); });
    }
  }

  function deleteMeetingAction(action, arr, idx) {
    if (action._id) {
      Actions.update(action._id, {$set: {inTrash: true}});
    }
    else {
      vm.actionItems.splice(idx, 1);
    }
    arr[idx] = false;
  }
}
