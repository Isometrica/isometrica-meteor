'use strict';

angular
  .module('isa.dashboard.calendar')
  .config(function($stateProvider) {
    $stateProvider
      .state('calendar', {
        parent: 'organisation',
        url: '/calendar/:filter?startAt',
        templateUrl: 'client/dashboard/calendar/view/calendar.ng.html',
        controller: 'CalendarController',
        params:  {
          filter: {
            value: 'yearly'
          }
        },
        data: {
          $subs: [
            { name: 'calendarEvents', args: ['filter', 'startAt'] }
          ]
        }
      })
  });
