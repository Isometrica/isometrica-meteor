Schemas = {};

/**
 * Embedded schema used in various places throughout the model to store
 * denormalized metadata about a user. For example, for storing data about
 * the owner of an AccountSubscription.
 *
 * @var SimpleSchema
 */
Schemas.IsaUserDoc = new SimpleSchema({
	_id: {
		type : SimpleSchema.RegEx.Id
	},
	at: {
		type : Date,
		autoValue: function() {
			return new Date();
		}
	},
	name: {
		type : String
	}
});

/**
 * Mixin for schemas that are 'owned' by the curren user.
 *
 * @var SimpleSchema
 */
Schemas.IsaOwnable = new SimpleSchema({
	owner: {
		type: Schemas.IsaUserDoc,
		autoValue: function() {
			if (this.isInsert && !this.isSet) {
				return Meteor.user().embeddedDoc();
			}
		}
	}
});

/*
 * Base schema that all schemas should extend
 */
Schemas.IsaBase = new SimpleSchema( {

	inTrash : {
        type : Boolean,
				defaultValue: false
    },
    created : {
        type : Object
    },
    'created._id' : {
        type : String,
        optional : true,    /* field is optional to deal with server initiated creations */
        autoValue: function() {
            if (this.isInsert) {
                return this.userId;
            }
        }
    },
    'created.name' : {
        type : String,
        autoValue : function() {
            if (this.isInsert) {
                if (this.userId === null) {
                    return "System";
                } else {
                    return Meteor.user().profile.fullName;
                }
            }
        }
    },
    'created.at': {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            }
        }
    },
    modified : {
        type : Object
    },
    'modified._id' : {
        type : String,
        optional : true,
        autoValue: function() {
            return this.userId;
        }
    },
   'modified.name' : {
        type : String,
        autoValue : function() {
            if (this.userId === null) {
                return "System";
            } else {
                return Meteor.user().profile.fullName;
            }
        }
    },
    'modified.at': {
        type: Date,
        autoValue: function() {
            return new Date();
        }
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
    placeholder: Match.Optional(String),
    focus: Match.Optional(Boolean)
  })
});
