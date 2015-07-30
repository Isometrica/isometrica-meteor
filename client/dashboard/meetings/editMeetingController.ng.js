angular
  .module('isa.dashboard.meetings')
  .controller('EditMeetingController', editMeetingController);

function editMeetingController(meetings, meeting, isNew, $modalInstance, growl) {
  var vm = this;

  vm.meeting = angular.copy(meeting || {});
  vm.isNew = isNew;

  vm.cancel = cancelDialog;
  vm.save = saveMeeting;

  function cancelDialog() {
    $modalInstance.dismiss('cancel');
  }

  function saveMeeting(form) {
    if (!form.$valid) {
      return;
    }

    if (isNew) {
      Meetings.insert(vm.meeting, saveCb);
    }
    else {
      Meetings.update(vm.meeting._id, form.$getSchemaOps(), saveCb);
    }

    function saveCb(err, result) {
      if (err) {
        growl.error("Unable to save meeting: " + err);
      }
      else {
        $modalInstance.close({reason: 'save'});
      }
    }
  }
}
