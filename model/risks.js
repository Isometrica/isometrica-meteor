
Risks = new MultiTenancy.Collection("risks");
ImprovementOps = new MultiTenancy.Collection("improvementOps");

'use strict';

/**
 * Taken from model/actions.js for reuse, this function creates
 * a base SimpleSchema with a pre-configured `referenceNo` field.
 * The base schema created will be suitable to use in partitioned
 * models that need an atomic reference number.
 *
 * @param prefix String
 * @return Object
 */
Schemas.IsaRefable = function(prefix) {
  return new SimpleSchema({
    referenceNo: {
      type: String,
      optional: true,
      autoValue: function() {
        if (this.isInsert && Meteor.isServer) {
          var org = this.field('_orgId');
          var counterName = prefix + (org && org.value ? org.value : 'global');
          var counter = incrementCounter(Counters, counterName);
          return prefix + counter;
        }
      }
    }
  });
};

Schemas.ImprovementOp = new MultiTenancy.Schema([
  Schemas.IsaBase,
  Schemas.IsaRefable('IM'),
  {
    origin: {
      type: String,
      allowedValues: [
        'new',
        'existing'
      ],
      isa: {
        fieldType: 'isaToggle',
        fieldChoices: [
          { label: 'New', value: 'new' },
          { label: 'Existing', value: 'existing' },
        ]
      }
    },
    description: {
      type: String,
      label: 'Description',
      isa: {
        placeholder: 'Enter a description.'
      }
    },
    status: {
      type: String,
      label: 'Status',
      defaultValue: 'open',
      allowedValues: [
        'open',
        'closed',
        'cancelled',
      ],
      isa: {
        fieldType: 'isaToggle',
        fieldChoices: [
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
          { label: 'Cancelled', value: 'cancelled' }
        ]
      }
    },
    exists: {
      type: Boolean,
      label: 'Plan exists?',
      isa: {
        fieldType: 'isaYesNo'
      }
    }
  }
]);
ImprovementOps.attachSchema(Schemas.ImprovementOp);

Schemas.Risk = new MultiTenancy.Schema([
  Schemas.IsaBase,
  Schemas.IsaOwnable,
  Schemas.IsaRefable('RK'),
  {
    name: {
      type: String,
      label: 'Name',
      isa: {
        wrapper: ['isaRefLabel'],
        placeholder: 'Enter a risk name.'
      }
    },
    type: {
      type: String,
      max : 500,
      label: "Risk type",
      isa: {
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter a risk type.',
        orgOptionKey: 'riskTypes'
      }
    },
    activityProcess: {
      type: String,
      max : 500,
      label: "Activity/process",
      isa: {
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter an activity or process.',
        orgOptionKey: 'activities'
      }
    },
    department: {
      type: String,
      max : 500,
      label: "Department",
      isa: {
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter a department.',
        orgOptionKey: 'departments'
      }
    },
    relatedRisks: {
      type: [SimpleSchema.RegEx.Id],
      label: "Links to other risks",
      defaultValue: [],
      optional: true,
      isa: {
        fieldType: 'isaCollectionItem',
        selectMultiple : true,
        placeholder : 'Select one or more risks'
      }
    },
    notes: {
      type: String,
      max : 1000,
      optional: true,
      isa: {
        fieldType: 'isaRichText'
      }
    },
    riskScoreBefore: {
      type: Number,
      isa: {
        fieldType: 'isaRiskScore'
      }
    },
    riskScoreAfter: {
      type: Number,
      optional: true,
      isa: {
        fieldType: 'isaRiskScore'
      }
    },
    evaluationComments: {
      type: String,
      max : 1000,
      label: 'Comments',
      optional: true,
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    previousLossExperience: {
      type: String,
      max : 1000,
      label: 'Previous loss experience',
      optional: true,
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    riskDescision: {
      type: String,
      label: 'Treatment decision',
      optional: true,
      allowedValues: [
        'Avoid',
        'Accept',
        'Eliminate source',
        'Share the risk',
        'Change likelihood'
      ]
    },
    riskPriority: {
      type: String,
      label: 'Treatment prioroity',
      optional: true,
      isa: {
        fieldType: 'isaToggle',
        fieldChoices: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' }
        ]
      }
    },
    treatmentControlComments: {
      type: String,
      max : 1000,
      label: 'Comments',
      optional: true,
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    targetDate: {
      type: Date,
      optional: true,
      label: 'Target date'
    },
    completedAndVerified: {
      type: Boolean,
      label: 'Completed and verified?',
      optional: true,
      isa: {
        fieldType: 'isaCheckbox'
      }
    },
    signedBy: {
      type: Schemas.IsaUserDoc,
      label: 'Signed By',
      optional: true,
      isa: {
        fieldType: 'isaUser'
      }
    },
    lastReviewed: {
      type: Date,
      optional: true,
      label: 'Last reviewed'
    },
    reviewedBy: {
      type: Schemas.IsaUserDoc,
      label: 'Reviewed by',
      optional: true,
      isa: {
        fieldType: 'isaUser'
      }
    },
    reviewStatus: {
      type: String,
      label: 'Review status',
      optional: true,
      isa: {
        fieldType: 'isaToggle',
        fieldChoices: [
          { label: 'Reviewed', value: 'reviewed' },
          { label: 'Awaiting', value: 'awaiting' },
          { label: 'Overdue', value: 'overdue' }
        ]
      }
    },
    improvementOps: {
      type: [SimpleSchema.RegEx.Id],
      defaultValue: []
    }
  }
]);
Risks.attachSchema(Schemas.Risk);

Risks.allow({
  insert: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  update: function() {
    return true;
  }
});

ImprovementOps.allow({
  insert: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  update: function() {
    return true;
  }
});
