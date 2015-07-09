
/**
 * Sample your models with created dates and creators as well as
 * update metdata.
 *
 * @author Steve Fortune
 */
Timestamp = function(col) {
  col.before.insert(function(userId, doc) {
      doc.createdAt = Date.now();
      doc.createdBy = userId;
      doc.modifiedAt = Date.now();
      doc.modifiedBy = userId;
      doc.inTrash = false;
  });
  col.before.update(function(userId, doc) {
      doc.modifiedAt = Date.now();
      doc.modifiedBy = userId;
  });
}
