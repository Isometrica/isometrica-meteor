var app = angular.module("isa.filters", [
	'ngSanitize'
]);

/*
 * Filter to replace line breaks with <br /> tags. The resulting HTML is automatically
 * sanitized if ng-bind-html is used.
 *
 * usage: <div ng-bind-html="contents | lineBreakFilter"></div>
 *
 * @author Mark Leusink
 */
app.filter('lineBreakFilter', function($sce) {

  return function(text) {
    if (!text) { return null; }
    return text.replace(/\n\r?/g, '<br />');
  };

});

/**
 * Filter to show a date/time in a 'time ago' like syntax (e.g. 5 seconds ago, an hour ago)
 * Uses Moment.js for formatting
 *
 * @author Mark Leusink
 */
app.filter('timeAgoFilter', function() {
    return function(dateString) {
    	if (!dateString) { return null; }
        return moment(dateString).fromNow();
    };
});

/**
 * Filter to show a date as eg 27 Jul 2015
 */
app.filter('isaDate', function() {
  return function(dateString, altText) {
    if (!dateString) {
      return altText;
    }
    return moment(dateString).format('D MMM YYYY');
  }
});

/**
 * Filter to show a date with time as eg 27 Jul 2015 15:22
 */
app.filter('isaDateTime', function() {
  return function(dateString, altText) {
    if (!dateString) {
      return altText;
    }
    return moment(dateString).format('D MMM YYYY hh:mm');
  }
});

/**
 * Filter to only show the first line of a multi-line text box
 */
app.filter('firstLine', function() {
  return function(text) {
    var parts = text ? text.split('\n') : [''];
    return parts[0];
  }
});

/**
 * Filter to capitalize first letter of text, lowercase the rest
 */
app.filter('capitalize', function() {
  return function(input) {
    if (angular.isString(input)) {
      input = input.toLowerCase();
      return input.substring(0,1).toUpperCase()+input.substring(1);
    }

    return input;
  }
});

/**
 * Transforms a name into a set of initials.
 *
 * @todo Rename to just 'initials'.
 */
app.filter('initials', function() {
  return function(name, altText) {
    if (!name || typeof name !== 'string') {
      return altText || '';
    }

    var parts = name.toUpperCase().split(' ');
    var answer = '';
    if (0 != parts.length) {
      answer += parts[0].charAt(0);
    }
    if (parts.length > 0) {
      answer += parts[parts.length - 1].charAt(0);
    }

    return answer;
  }
});
