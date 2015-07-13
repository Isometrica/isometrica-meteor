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