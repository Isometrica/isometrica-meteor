angular
  .module('isa.orgSetup')
  .controller('MissionDlgController', missionDlgController);

function missionDlgController(org, $modalInstance, growl) {
  var dlg = this;
  dlg.org = org;

  Organisations.update({_id: org._id}, { $addToSet: { setupViewed: 'mission' }});

  dlg.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  dlg.done = function(form) {
    var ops = form.$getSchemaOps();
    if (!ops) {
      $modalInstance.close('save');;
    }
    else {
      ops.$addToSet = {setupDone: 'mission'};

      Organisations.update(org._id, ops, function(err) {
        if (err) {
          growl.error(err);
        }
        else {
          $modalInstance.close('save');
        }
      });
    }
  }
}
