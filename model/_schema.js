Schemas = {};

/*
 * Base schema that all schemas should extend
 */
Schemas.IsaBase = new SimpleSchema( {

	inTrash : {
        type : Boolean,
				defaultValue: false
    },
	createdBy : {
        type : String,
        max : 200,
        optional : true,
        autoValue: function() {
            if (this.isInsert) {
                return this.userId;
            } else {
                this.unset();
            }
        }
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else {
                this.unset();
            }
        }
    },
    modifiedBy : {
        type : String,
        max : 200,
				optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return this.userId;
            } else {
                this.unset();
            }
        }
    },
	modifiedAt: {
        type: Date,
        autoValue: function() {
            return new Date();
        },
        optional: true
    },
    files: {
        type: [Object],
        optional: true
    },
    "files.$._id": {
          type: String
    },
    "files.$.name": {
          type: String
    },
    "files.$.size": {
          type: Number
    },
    "files.$.isImage": {
          type: Boolean
    }

});

SimpleSchema.extendOptions({
  isa: Match.Optional({
    fieldType: Match.Optional(String),
    inputType: Match.Optional(String),
    helpId: Match.Optional(String),
    placeholder: Match.Optional(String)
  })
});

/**
 * Mixin for partitioned schemas
 */
Schemas.IsaPartition = new SimpleSchema({
  _groupId: {
    type: String,
		optional: true
  }
});
