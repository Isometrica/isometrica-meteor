'use strict';

if (!isa) {
  isa = {};
}

isa.handleQuery = function(success) {
  return function(err, res) {
    if (err) {
      var tb = Observatory.getToolbox();
      tb.error('Bad db operation: ' + err);
    } else {
      success(res);
    }
  }
};
