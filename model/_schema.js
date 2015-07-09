Schemas = {};

SimpleSchema.extendOptions({
  isa: Match.Optional({
    helpId: Match.Optional(String),
  })
});
