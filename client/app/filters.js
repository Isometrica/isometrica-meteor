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
