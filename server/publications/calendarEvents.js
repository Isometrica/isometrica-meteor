'use strict';

/**
 * @author Steve Fortune
 * @param filter    String  yearly | quarterly | monthly
 * @param startAtLb   Date
 */
Meteor.publish("calendarEvents", function(filter, startAt) {

  var filters = [ 'year', 'quarter' ];

  check(startAt, String);
  check(filter, Match.Where(function(cand) {
    return ~filters.indexOf(cand);
  }));

  var startAtLb = new Date(startAt),
      startAtUb = startAtLb.from(filter);
  return CalendarEvents.findBetween(startAtLb, startAtUb);

});
