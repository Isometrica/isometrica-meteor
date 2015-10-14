CalendarEvents = new MultiTenancy.Collection("calendarEvents");

/**
 * @name CalendarUtils
 * @description
 * Global namespace for some isomorphic date helper functions.
 * These use moment.js to manipulate dates appropriately for both
 * frontend services and server-side publications
 */
CalendarUtils = {};

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
 * Gets 'now' in UTC time as an ISO date string.
 *
 * @return String
 */
CalendarUtils.now = function() {
  return moment().utc().format();
};

/**
 * This function takes a date string, floors it to the nearest
 * interval (either a 'year' or a 'quarter') and returns it as
 * a date object.
 *
 * The date string is assumed to be in UTC and converted to a
 * date in the machine's local timezone before returning. Note
 * that the server's local timezone should be configured to be
 * UTC.
 *
 * This will be useful on the client, where we want the date
 * strings in the URL to be
 *
 * @param startAt   Date
 * @param interval  String  'year' | 'quarter'
 * @return Date
 */
CalendarUtils.normalize = function(dateStr, interval) {
  var date = moment.utc(dateStr), normalized = moment.utc({ year: date.year() });
  if (interval === 'quarter') {
    normalized.quarter(date.quarter());
  }
  return normalized.toDate();
};

/**
 * Takes a date object and returns a new date `interval` from it.
 *
 * @param date      Date
 * @param interval  String  'year' | 'quarter'
 * @param back      Boolean
 * @return Date
 */
CalendarUtils.from = function(date, interval, back) {
  var toDate = new Date(date);
  switch (interval) {
    case 'year':
      var yearDiff = back ? -1 : 1;
      toDate.setFullYear(date.getFullYear() + yearDiff);
      break;
    case 'quarter':
      var monthDiff = back ? -3 : 3;
      toDate.setMonth(date.getMonth() + monthDiff);
      break;
  }
  return toDate;
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
