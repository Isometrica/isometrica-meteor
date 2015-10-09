angular
  .module('isa.orgSetup')
  .controller('StringListDlgController', stringListDlgController);

function stringListDlgController(title, org, item, textId, $modalInstance, growl) {
  var dlg = this;
  dlg.title = title;
  dlg.itemList = org[item] || [];
  dlg.textId = textId;

  Organisations.update(org._id, { $addToSet: { setupViewed: item }});

  dlg.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  dlg.done = function() {
    var ops = { $addToSet: { setupDone: item }, $set: {}};
    ops.$set[item] = dlg.itemList;

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
