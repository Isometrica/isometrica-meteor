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
  vm.attendees = angular.copy(attendees || []);
  vm.agendaItems = angular.copy(agendaItems || []);
  vm.prevActionItems = angular.copy(prevActionItems || []);
  vm.actionItems = angular.copy(actionItems || []);
  vm.isNew = !vm.meeting.hasOwnProperty('_id');

  vm.configureMeetingType = function(fields) {
    if (vm.isNew) {
      fields[0].type = 'isaInputOptions';
      fields[0].templateOptions.fieldChoices = _.map(MeetingsService.getMeetingTypeNames(), function(type) {
        return { value: type }
      });
      fields[0].templateOptions.onChange = onMeetingTypeChanged;
      fields[0].templateOptions.onSelected = checkForNewMeetingType;
    }
    else {
      fields[0].templateOptions.disabled = true;
    }
  };

  vm.cancel = cancelDialog;
  vm.save = saveMeeting;
  vm.delete = deleteMeeting;

  vm.attOpen = [];
  vm.addAttendee = addAttendee;
  vm.deleteAttendee = deleteAttendee;
  $scope.updateInitials = vm.updateInitials = updateInitials;
  vm.configureAttendees = function(fields) {
    fields[0].templateOptions.onChange = updateInitials;
  };

  vm.aiOpen = [];
  vm.addAgendaItem = addAgendaItem;
  vm.deleteAgendaItem = deleteAgendaItem;
  vm.computeAgendaStyle = computeAgendaStyle;

  vm.maOpen = [];
  vm.addMeetingAction = addMeetingAction;
  var otherAgendaItems = {};
  vm.agendaItemsFrom = function(mtgId) {
    if (otherAgendaItems.hasOwnProperty(mtgId)) {
      return otherAgendaItems[mtgId];
    }
    return otherAgendaItems[mtgId] = AgendaItems.find({meetingId: mtgId, inTrash: false}).fetch();
  };

  function onMeetingTypeChanged() {
    checkForNewMeetingType();
    fetchMeetingItems();
  }

  function checkForNewMeetingType() {
    var val = _.indexOf(MeetingsService.getMeetingTypeNames(), vm.meeting.type);
    vm.isNewType = vm.meeting.type && vm.meeting.type.length && -1 === val;
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
      return;
    }

    if (vm.attendees.length < 2) {
      growl.error('A meeting must include at least 2 attendees');
      return;
    }

    if (!vm.meeting._id) {
      Meetings.insert(vm.meeting, function(err, newId) {
        if (!err) {
          vm.meeting._id = newId;
          if (vm.createNewType) {
            MeetingsService.addMeetingType(vm.meeting.type);
          }
        }
        saveCb(err);
      });
    }
    else {
      var ops = form.$getSchemaOps();
      if (null != ops) {
        Meetings.update(vm.meeting._id, form.$getSchemaOps(), saveCb);
      }
      else {
        saveCb(null);
      }
    }

    function saveCb(err) {
      if (err) {
        growl.error("Unable to save meeting: " + err);
      }
      else {
        $q.all([saveAttendees(), saveAgendaItems(), saveActionItems()])
          .then(function() {
            $scope.$root.$broadcast('isaMeetingSaved', vm.meeting._id);
            $modalInstance.close({reason: 'save', meetingId: vm.meeting._id});
          }, function(err) {
            growl.error(err);
          }, null);
      }
    }
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

  function updateInitials(val, fieldDef, scope) {
    var att = scope.model;
    if (!att.name) {
      att.initials = "";
    }
    else {
      var parts = att.name.split(' ');
      if (1 < parts.length) {
        att.initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
      }
      else {
        att.initials = parts[0].charAt(0);
      }
    }
  }

  function saveAttendees() {
    var promises = [];
    _.each(vm.attendees, function(attendee, idx) {
      // Skip new items that are already trashed
      if (attendee.inTrash && !attendee._id) {
        return;
      }

      var defer = $q.defer();
      promises.push(defer.promise);
      var cbFn = function(err, result) {
        if (err) {
          defer.reject('Attendee #' + (idx + 1) + ': ' + (err.message ? err.message : err));
        }
        else {
          defer.resolve(result);
        }
      };

      if (!attendee._id) {
        attendee.meetingId = vm.meeting._id;
        Attendees.insert(attendee, cbFn)
      }
      else {
        Attendees.update(attendee._id, {
          $set: {
            name: attendee.name,
            initials: attendee.initials,
            isRegular: attendee.isRegular,
            inTrash: attendee.inTrash
          }
        }, cbFn);
      }
    });

    return $q.all(promises);
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

  function saveAgendaItems() {
    var promises = [];
    _.each(vm.agendaItems, function(agenda, idx) {
      // Skip new items that are already trashed
      if (agenda.inTrash && !agenda._id) {
        return;
      }

      var defer = $q.defer();
      promises.push(defer.promise);
      var cbFn = function(err, result) {
        if (err) {
          defer.reject('Agenda #' + (idx + 1) + ': ' + (err.message ? err.message : err));
        }
        else {
          defer.resolve(result);
        }
      };

      if (!agenda._id) {
        agenda.meetingId = vm.meeting._id;
        AgendaItems.insert(agenda, cbFn)
      }
      else {
        AgendaItems.update(agenda._id, {
          $set: {
            itemNo: agenda.itemNo,
            details: agenda.details,
            whoSubmitted: agenda.whoSubmitted,
            isRegular: agenda.isRegular,
            comments: agenda.comments,
            inTrash: agenda.inTrash
          }
        }, cbFn);
      }
    });

    return $q.all(promises);
  }

  function addMeetingAction() {
    vm.actionItems.push({referenceNumber: '(new)', status: {'value': 'open'}});
    vm.maOpen[vm.actionItems.length - 1] = true;
  }

  function saveActionItems() {
    var promises = [];
    _.each(vm.actionItems.concat(vm.prevActionItems), function(actionItem, idx) {
      // Skip new items that are already trashed
      if (actionItem.inTrash && !actionItem._id) {
        return;
      }

      var defer = $q.defer();
      promises.push(defer.promise);
      var cbFn = function(err, result) {
        if (err) {
          defer.reject('Action #' + (idx + 1) + ': ' + (err.message ? err.message : err));
        }
        else {
          defer.resolve(result);
        }
      };

      if (!actionItem._id) {
        actionItem.meetingId = vm.meeting._id;
        actionItem.meetingType = vm.meeting.type;
        MeetingActions.insert(actionItem, cbFn)
      }
      else {
        console.log('updating action item', actionItem);
        MeetingActions.update(actionItem._id, {
          $set: {
            referenceNumber: actionItem.referenceNumber,
            agendaItem: actionItem.agendaItem,
            description: actionItem.description,
            targetDate: actionItem.targetDate,
            'status.value': actionItem.status.value,
            owner: actionItem.owner,
            notes: actionItem.notes,
            inTrash: actionItem.inTrash
          }
        }, cbFn);
      }
    });

    return $q.all(promises);
  }
}
