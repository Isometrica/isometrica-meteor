Schemas = {};

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
    fieldChoices: Match.Optional([Object]),
    inputType: Match.Optional(String),
    helpId: Match.Optional(String),
    placeholder: Match.Optional(String),
    focus: Match.Optional(Boolean)
  })
});
