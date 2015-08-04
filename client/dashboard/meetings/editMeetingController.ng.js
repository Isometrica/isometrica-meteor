angular
  .module('isa.dashboard.meetings')
  .controller('EditMeetingController', editMeetingController);

function editMeetingController(meeting, attendees, $q, $modalInstance, growl, $scope) {
  var vm = this;

  vm.meeting = angular.copy(meeting || {});
  vm.attendees = angular.copy(attendees || []);
  vm.isNew = !vm.meeting.hasOwnProperty('_id');

  vm.cancel = cancelDialog;
  vm.save = saveMeeting;

  vm.attOpen = [];
  vm.addAttendee = addAttendee;
  vm.deleteAttendee = deleteAttendee;
  $scope.updateInitials = vm.updateInitials = updateInitials;
  vm.configureAttendees = function(fields) {
    fields[0].templateOptions.onChange = updateInitials;
  };

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
        saveAttendees()
          .then(function() {
            $modalInstance.close({reason: 'save', meetingId: vm.meeting._id });
          }, function (err) {
            console.log("Errors saving:", err);
            growl.error(err);
          });
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
}
