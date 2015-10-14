'use strict';

/**
 * @author Steve Fortune
 * @param filter    String  yearly | quarterly | monthly
 * @param startAtLb   Date
 */
Meteor.publish("calendarEvents", function(filter, startAt) {

  var filters = [ 'year', 'quarter' ];
  startAt = startAt || CalendarUtils.now();

  check(startAt, String);
  check(filter, Match.Where(function(cand) {
    return ~filters.indexOf(cand);
  }));

  var startAtLb = CalendarUtils.normalize(startAt, filter),
      startAtUb = CalendarUtils.from(startAtLb, filter);

  console.log('----');
  console.log('Start', startAtLb);
  console.log('End', startAtUb);

  return CalendarEvents.findBetween(startAtLb, startAtUb);

});
