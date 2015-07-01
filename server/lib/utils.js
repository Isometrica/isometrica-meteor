
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

/**
 * Obscures the user document's `phoneNumber`'s based on various
 * access requirements.
 */
isa.obscureNumbers = function(doc) {

  var resolve = function() {
    cb(null);
  };
  var reject = function() {
    phoneNumbers.forEach(function(number) {
      number.isObscure = true;
      number.number = '*******';
    });
    resolve();
  };

  if (
    contactable.areNumbersPrivate &&
    helpers.coerceObjId(contactable.id) !== helpers.coerceObjId(currentId)
  ) {
    CallTreeNode.find({
      where: {
        $or: [
          { userId: contactable.id },
          { contactId: contactable.id }
        ],
        ownerId: currentId
      }
    }, helpers.handleQuery(cb, function(result) {
      if (!result || !result.length) {
        /// TODO: Manager's manager...
        reject();
      } else {
        resolve();
      }
    }));

  } else {
    resolve();
  }

};
