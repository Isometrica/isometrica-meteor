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
          { startAt: { $gte: lb } },
          { startAt: { $lt: ub } }
        ]
      },
      {
        $and: [
          { startAt: { $lte: lb } },
          { endAt: { $gte: lb } }
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
  var normalized = new Date(this.getFullYear(), 0, 1);
  if (interval === 'quarter') {
    var monthsPerQ = 3, quarter = Math.floor(this.getMonth()/monthsPerQ);
    normalized.setMonth(quarter*monthsPerQ);
  }
  return normalized;
};


/**
 * Helper method that creates a new date either a 'year' or
 * a 'quarter' from this date.
 *
 * @param   interval  String  'year' | 'quarter'
 * @param   back      Boolean
 * @return  Date
 */
Date.prototype.from = function(interval, back) {
  var date = new Date(this), days;
  switch (interval) {
    case 'year':
      var yearDiff = back ? -1 : 1;
      date.setFullYear(this.getFullYear() + yearDiff);
      break;
    case 'quarter':
      var monthDiff = back ? -3 : 3;
      date.setMonth(this.getMonth() + monthDiff);
      break;
    default:
      throw new Error("Unsupported interval");
  }
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
      label: 'End Date',
      /**
       * @todo Move this to a custom validator (at the moment it doesn't
       * seem to work). The issue here is that this isn't always run every
       * update, so users can update an event to start after it ends.
       */
      autoValue: function() {
        var startAt = this.field('startAt').value, endAt = this.value;
        if (startAt && !endAt || (endAt && endAt.getTime() < startAt.getTime())) {
          var endAt = new Date(startAt);
          endAt.setDate(endAt.getDate() + 1);
          return endAt;
        }
      }
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
