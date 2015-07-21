Schemas = {};

/*
 * Base schema that all schemas should extend
 */
Schemas.IsaBase = new SimpleSchema( {

	inTrash : {
        type : Boolean,
        optional : true,
        autoValue: function() {
            if (this.isInsert) {
                return false;
            }
        },
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
    }

});

SimpleSchema.extendOptions({
  isa: Match.Optional({
    helpId: Match.Optional(String)
  })
});
