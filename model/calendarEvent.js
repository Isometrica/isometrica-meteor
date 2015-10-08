CalendarEvents = new MultiTenancy.Collection("calendarEvents");

'use strict';

/**
 * A simple extention that can be used on both client and server
 * to query calendar events that fall between 2 dates (lb and ub).
 *
 * @note Considered using `rclai/meteor-collection-extensions`
 * but its overkill for this.
 *
 * @param  lb   Date
 * @param  ub   Date
 * @param  sel  Object
 * @param  opts Options
 * @return Cursor
 * @author Steve Fortune
 */
CalendarEvents.findBetween = function(lb, ub, sel, opts) {
  sel = sel || {};
  opts = opts || {};
  return this.find(_.extend(sel, {
    $or: [
      {
        $and: [
          { startAt: { $gt: lb } },
          { startAt: { $lt: ub } }
        ]
      },
      {
        $and: [
          { startAt: { $lt: lb } },
          { endAt: { $gt: lb } }
        ]
      },
    ]
  }), opts);
};

/**
 * @name Some isomorphic extentions to the native Date object to
 * make it easier to construct our calendar offset dates.
 *
 * @note I don't think extending native Date object prototype is
 * if the best way to do this. We could consider using Moment.js
 */

/**
 * Helper method that floors a date to the nearest year. If
 * the interval is specified as 'quarter' then its floored
 * to the nearest quarter.
 *
 * @param startAt   Date
 * @param interval  String  'year' | 'quarter'
 * @return Date
 */
Date.prototype.normalize = function(interval) {
  var normalized = new Date(this.getFullYear(), 1, 1);
  if (interval === 'quarter') {
    var quarter = Math.floor(this.getMonth()/3) + 2;
    normalized.setMonth(quarter);
  }
  return normalized;
};

/**
 * Helper method that creates a new date either a 'year' or
 * a 'quarter' from this date.
 *
 * @param interval  String  'year' | 'quarter'
 * @return Date
 */
Date.prototype.from = function(interval) {
  var date = new Date(this), days;
  switch (interval) {
    case 'year':
      days = 365;
      break;
    case 'quarter':
      days = 92;
      break;
    default:
      throw new Error("Unsupported interval");
  }
  date.setDate(this.getDate() + days);
  return date;
};

/**
 * Events (either milestones or date ranges) that are rendered
 * in the calendar.
 *
 * @todo Are there any requirements for this to integrate
 * with the work inbox?
 * @author Steve Fortune
 */
Schemas.CalendarEvent = new MultiTenancy.Schema([
  Schemas.IsaBase,
  {
    topic: {
      type: String,
      label: 'Topic',
      allowedValues: [
        'Awareness',
        'Training',
        'Customer Survey',
        'Supplier Survey',
        'Internal Audit',
        'External Audit',
        'Management Review'
      ],
      isa: {
        placeholder: 'Select a topic.'
      }
    },
    managementProgram: {
      type: String,
      max : 500,
      label: "Management Program",
      isa: {
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter a management program.',
        orgOptionKey: 'managementPrograms'
      }
    },
    description: {
      type: String,
      label: "Description",
      optional: true,
      max: 500,
      isa: {
        fieldType: 'isaTextarea',
        placeholder: 'Enter the a description.'
      }
    },
    type: {
      type: String,
      max : 500,
      label: "Type",
      isa: {
        fieldType: 'isaToggle',
        fieldChoices: [
          { label: 'Milestone', value: 'milestone' },
          { label: 'Date range', value: 'date_range' },
        ]
      }
    },
    startAt: {
      type: Date,
      label: 'Start Date'
    },
    endAt: {
      type: Date,
      label: 'End Date'
    },
    notes: {
      type : String,
      optional : true,
      isa: {
        fieldType: 'isaRichText'
      }
    }
  }
]);

CalendarEvents.allow({
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
