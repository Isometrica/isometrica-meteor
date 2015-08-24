angular
  .module('isa.dashboard.meetings')
  .controller('EditMeetingController', editMeetingController);

function editMeetingController(meeting, attendees, agendaItems, actionItems, MeetingsService, $q, $modalInstance, growl, $scope) {
  var vm = this;

  vm.meeting = angular.copy(meeting || {});
  vm.attendees = angular.copy(attendees || []);
  vm.agendaItems = angular.copy(agendaItems || []);
  vm.actionItems = angular.copy(actionItems || []);
  vm.isNew = !vm.meeting.hasOwnProperty('_id');

  vm.configureMeeting = function(fields) {
    if (vm.isNew) {
      fields[0].type = 'isaSelect';
      fields[0].templateOptions.options = MeetingsService.getMeetingTypeNames();
      fields[0].templateOptions.valueProp = 'name';
      fields[0].templateOptions.onChange = fetchMeetingItems;
    }
    else {
      fields[0].templateOptions.disabled = true;
    }
  };

  vm.cancel = cancelDialog;
  vm.save = saveMeeting;

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

  function fetchMeetingItems() {
    MeetingsService.fetchPreviousMeetingItems(vm.meeting.type)
      .then(function (items) {
        vm.attendees = items.attendees;
        vm.agendaItems = items.agendaItems;
      });
  }

  function cancelDialog() {
    $modalInstance.dismiss('cancel');
  }

  function saveMeeting(form) {
    if (!form.$valid) {
      return;
    }

    if (!vm.meeting._id) {
      Meetings.insert(vm.meeting, function(err, newId) {
        if (!err) {
          vm.meeting._id = newId;
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
            $modalInstance.close({reason: 'save', meetingId: vm.meeting._id });
          }, function (err) {
            growl.error(err);
          }, null);
      }
    }
  }

  function addAttendee() {
    vm.attendees.push({});
    vm.attOpen[vm.attendees.length-1] = true;
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
      var cbFn = function (err, result) {
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
    vm.agendaItems.push({ itemNo: vm.agendaItems.length + 1 });
    vm.aiOpen[vm.agendaItems.length-1] = true;
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
      var cbFn = function (err, result) {
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
    vm.actionItems.push({ referenceNumber: '(new)', status: 'open' });
    vm.maOpen[vm.actionItems.length-1] = true;
  }

  function saveActionItems() {
    var promises = [];
    _.each(vm.actionItems, function(actionItem, idx) {
      // Skip new items that are already trashed
      if (actionItem.inTrash && !actionItem._id) {
        return;
      }

      var defer = $q.defer();
      promises.push(defer.promise);
      var cbFn = function (err, result) {
        if (err) {
          defer.reject('Action #' + (idx + 1) + ': ' + (err.message ? err.message : err));
        }
        else {
          defer.resolve(result);
        }
      };

      if (!actionItem._id) {
        actionItem.meetingId = vm.meeting._id;
        actionItem.originalMeetingId = vm.meeting._id;
        MeetingActions.insert(actionItem, cbFn)
      }
      else {
        MeetingActions.update(actionItem._id, {
          $set: {
            referenceNumber: actionItem.referenceNumber,
            agendaItem: actionItem.agendaItem,
            description: actionItem.description,
            targetDate: actionItem.targetDate,
            status: actionItem.status,
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
