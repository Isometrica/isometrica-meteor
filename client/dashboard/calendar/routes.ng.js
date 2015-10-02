'use strict';

angular
  .module('isa.dashboard.calendar')
  .config(function($stateProvider) {
    $stateProvider
      .state('calendar', {
        parent: 'organisation',
        url: '/calendar',
        templateUrl: 'client/dashboard/calendar/view/calendar.ng.html',
        controller: 'CalendarController',
        data: {
          $subs: ['calendarEvents']
        }
      })
  });
