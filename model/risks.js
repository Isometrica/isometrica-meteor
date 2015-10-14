
Risks = new MultiTenancy.Collection("risks");

'use strict';

Schemas.ImprovementOps = new SimpleSchema([
  Schemas.IsaBase,
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
        fieldType: 'isaToggle',
      }
    },
    referenceNo: {
      type: Number
    }
  }
]);

Schemas.Risk = new MultiTenancy.Schema([
  Schemas.IsaBase,
  Schemas.IsaOwnable,
  {
    name: {
      type: String,
      label: 'Name',
      isa: {
        placeholder: 'Enter the contact name.'
      }
    },
    referenceNo: {
      type: Number
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
      isa: {
        // TODO:
      }
    },
    notes: {
      type: String,
      max : 1000,
      isa: {
        fieldType: 'isaNotes'
      }
    },
    riskScore: {
      type: Number,
      isa: {
        fieldType: 'isaRiskCard'
      }
    },
    evaluationComments: {
      type: String,
      max : 1000,
      label: 'Comments',
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    previousLossExperience: {
      type: String,
      max : 1000,
      label: 'Previous loss experience',
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    riskDescision: {
      type: String,
      label: 'Risk decision',
      allowedValues: [
        'Avoid',
        'Accept',
        'Eliminate source',
        'Share the risk',
        'Change likelihood'
      ]
    },
    treatmentControlComments: {
      type: String,
      max : 1000,
      label: 'Comments',
      isa: {
        fieldType: 'isaTextarea'
      }
    },
    targetDate: {
      type: Date,
      label: 'Target date'
    },
    completedAndVerified: {
      type: Boolean,
      label: 'Compled and verified?',
      isa: {
        fieldType: 'isaCheckbox'
      }
    },
    signedBy: {
      type: Schemas.IsaUserDoc,
      label: 'Signed By',
      isa: {
        fieldType: 'isaUserPicker'
      }
    },
    lastReviewed: {
      type: Date,
      label: 'Last reviewed'
    },
    reviewedBy: {
      type: Schemas.IsaUserDoc,
      label: 'Reviewed by',
      isa: {
        fieldType: 'isaUserPicker'
      }
    },
    reviewStatus: {
      type: String,
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
      type: [Schemas.ImprovementOps],
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
