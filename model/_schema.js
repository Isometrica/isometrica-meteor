Schemas = {};

'use strict';

SimpleSchema.extendOptions({
  isa: Match.Optional({
    orgOptionKey: Match.Optional(String),
    fieldType: Match.Optional(String),
    selectMultiple : Match.Optional(Boolean),
    fieldChoices: Match.Optional([Object]),
    inputType: Match.Optional(String),
    helpId: Match.Optional(String),
    placeholder: Match.Optional(String),
    focus: Match.Optional(Boolean),
    rows: Match.Optional(Number),
    cols: Match.Optional(Number),
    userTypes: Match.Optional([String])
  })
});

/**
 * Mixing for entities that contain an embedded array of phone
 * numbers.
 *
 * @var SimpleSchema
 */
Schemas.IsaContactable = new SimpleSchema({
  phoneNumbers: {
    type: [Object],
    defaultValue: []
  },
  'phoneNumbers.$.number': {
    type: String,
    //minCount: 8,
    maxCount: 50
    //regEx: /^\+\d?[0-9-() ]+$/,
  },
  'phoneNumbers.$.type': {
    type: String,
    allowedValues: [
      "Work",
      "Home",
      "Mobile"
    ]
  }
});

/**
 * Embedded schema that points to a file. Contains metadata about the
 * file such as its size.
 *
 * @var SimpleSchema
 */
Schemas.IsaFileDescriptor = new SimpleSchema({
  _id: {
    type: String
  },
  name: {
    type: String
  },
  size: {
    type: Number
  }
});

/**
 * Mixin for entities that have profile images.
 *
 * @var SimpleSchema
 */
Schemas.IsaProfilePhoto = new SimpleSchema({
  photo: {
    type: Schemas.IsaFileDescriptor,
    label: "Photo",
    optional: true,
    isa: {
      fieldType: 'isaPhoto'
    }
  },
  defaultPhotoUrl: {
    type: String,
    autoValue: function() {
      if (this.isInsert || !this.isSet) {
        var id = Math.floor(Math.random()*16);
        return 'img/avatar/' + id + '.png';
      }
    }
  }
});

/**
 * Embedded schema used in various places throughout the model to store
 * denormalized metadata about a user. For example, for storing data about
 * the owner of an AccountSubscription.
 *
 * @todo Rename this to 'IsaUserDescriptor'
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
	fullName: {
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

// @todo Use Schemas.IsaUserDoc ?
Schemas.IsaHistoryRecord = new SimpleSchema({
  _id: {
    type: String
  },
  fullName: {
    type: String
  },
  value: {
    type: String
  },
  at: {
    type: Date
  }
});

Schemas.IsaStatus = new SimpleSchema({
  value: {
    type: String,
    label: 'Status',
    isa: {
      fieldType: 'isaToggle',
      fieldChoices: [
        {
          'label': 'Needs a plan',
          'value': 'needsPlan'
        },
        {
          'label': 'Open',
          'value': 'open'
        }, {
          'label': 'Closed',
          'value': 'closed'
        }, {
          'label': 'Canceled',
          'value': 'canceled'
        }
      ]
    }
  },
  history: {
    type: [Schemas.IsaHistoryRecord],
    autoValue: function() {
      var val = this.siblingField('value');
      if (val.isSet) {
        var historyObj = {
          _id: this.userId,
          fullName: Meteor.user().profile.fullName,
          value: val.value,
          at: new Date()
        };

        return this.isInsert ? [ historyObj ] : { $push: historyObj };
      }
      else {
        this.unset();
      }
    }
  },
  at: {
    type: Date,
    autoValue: function() {
      var val = this.siblingField('value');
      if (val.isSet) {
        return new Date();
      }
      else {
        this.unset();
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
    'created.fullName' : {
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
   'modified.fullName' : {
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
