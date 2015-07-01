
/**
 * @namespace For our server side utilities
 */
isa = {};

/**
 * Returns a closure for handling a query.
 *
 * @param success Function
 * @return Function
 */
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

/**
 * Returns a closure for sorting a collection alphabetically
 * by a given key.
 *
 * @param key String
 * @return Function
 */
isa.alphabetically = function(key) {
  return function() {
    var res = 0;
    if (a[key] < b[key]) {
        res = -1;
    } else {
        res = 1;
    }
    return res;
  };
};
