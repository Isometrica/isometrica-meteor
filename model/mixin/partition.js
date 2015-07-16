
/**
 * Addeds relevant partition fields to your schema
 *
 * @author Steve Fortune
 */
Partition = function(schema) {
  schema._schema.groupId = {
    type: String
  };
};
