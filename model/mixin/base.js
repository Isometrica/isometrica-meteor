
/**
 * Sample your models with created dates and creators as well as
 * update metdata.
 *
 * @author Steve Fortune
 */
Base = function(col, schema) {

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

  if (schema) {
    _.extend(schema._schema, {
      createdAt: {
        type: Date
      },
      createdBy: {
        type: String
      },
      modifiedBy: {
        type: Date
      },
      modifiedBy: {
        type: String
      },
      inTrash: {
        type: Boolean
      }
    });
  }

}
