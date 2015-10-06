'use strict';

/**
 * @author Steve Fortune
 * @param filter    String  yearly | quarterly | monthly
 * @param startAtLb   Date
 */
Meteor.publish("calendarEvents", function(filter, startAt) {

  startAt = startAt || new Date();
  var intervalMap = {
    'yearly': 365,
    'quarterly': 92,
    'monthly': 31
  };
  check(filter, Match.Where(function(cand) {
    return ~_.keys(intervalMap).indexOf(cand);
  }));
  check(startAtLb, Match.Where(function(cand) {
    return _.isNaN(Date.parse(cand));
  }));

  var startAtLb = new Date(startAt),
      startAtUb = new Date(),
      interval = intervalMap[filter];

  startAtUb.setDate(startAtLb.getDate() + interval);

  return CalendarEvents.findBetween(startAtLb, startAtUb, {}, {
    sort: {
      startAt: 1
    }
  });

});
