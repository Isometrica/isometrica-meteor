angular
  .module('isa.orgSetup')
  .controller('MultiListDlgController', multiListDlgController);

function multiListDlgController(title, org, item, typeOptions, $modalInstance, growl) {
  var dlg = this;
  dlg.title = title;
  dlg.itemList = org[item] || [];
  dlg.typeOptions = typeOptions || [];
  dlg.newItem = {};

  Organisations.update(org._id, { $addToSet: { setupViewed: item }});

  dlg.removeItem = function(idx) {
    dlg.itemList.splice(idx, 1);
  };

  dlg.addItem = function() {
    if (dlg.newItem.name && dlg.newItem.name.length !== 0) {
      dlg.itemList.push(dlg.newItem);
      dlg.newItem = {}
    }
  };

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
