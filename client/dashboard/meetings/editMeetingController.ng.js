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
  vm.deleteAttendee = deleteAttendee;

  vm.aiOpen = [];
  vm.addAgendaItem = addAgendaItem;
  vm.deleteAgendaItem = deleteAgendaItem;
  vm.computeAgendaStyle = computeAgendaStyle;

  vm.maOpen = { open: [], closed: [], added: [] };
  vm.addMeetingAction = addMeetingAction;

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
          Attendees.insert(doc, subItemCb);
        }
        else {
          Attendees.update(doc._id, ops, subItemCb);
        }
        break;

      case 'AgendaItems':
        if (!doc._id) {
          doc.meetingId = vm.meeting._id;
          AgendaItems.insert(doc, subItemCb);
        }
        else {
          AgendaItems.update(doc._id, ops, subItemCb);
        }
        break;

      case 'Actions':
        if (!doc._id) {
          doc.meeting.meetingid = vm.meeting._id;
          doc.meeting.meetingType = vm.meeting.type;
          Actions.insert(doc, subItemCb);
        }
        else {
          Actions.update(doc._id, ops, subItemCb);
        }
        break;
    }

    _.each(schemaCtrl.$childSchemas, function(sub) { saveChild(sub, promises); });
  }

  function addAttendee() {
    vm.attendees.push({});
    vm.attOpen[vm.attendees.length - 1] = true;
  }

  function deleteAttendee(idx) {
    var att = vm.attendees[idx];
    att.inTrash = !att.inTrash;
    vm.attOpen[idx] = !att.inTrash;
  }

  function addAgendaItem() {
    vm.agendaItems.push({itemNo: vm.agendaItems.length + 1});
    vm.aiOpen[vm.agendaItems.length - 1] = true;
  }

  function deleteAgendaItem(idx) {
    var agenda = vm.agendaItems[idx];
    agenda.inTrash = !agenda.inTrash;
    vm.aiOpen[idx] = !agenda.inTrash;
  }

  function computeAgendaStyle(agenda) {
    var answer = {};
    if (agenda.inTrash) {
      answer['text-decoration'] = 'line-through';
    }
    if (!agenda.isRegular) {
      answer['font-weight'] = 700;
    }

    return answer;
  }

  function addMeetingAction() {
    vm.actionItems.push({type: 'meeting', referenceNumber: '(new)', status: {'value': 'open'}, meeting: {}});
    vm.maOpen.added[vm.actionItems.length - 1] = true;
  }
}
