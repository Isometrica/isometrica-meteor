angular
  .module('isa.orgSetup')
  .directive('setupStatus', setupStatusDirective);

function setupStatusDirective() {
  return {
    link: function(scope, elem, attr) {
      var parts = attr.setupStatus.split(':');
      var type = parts[1];

      scope.$watchCollection(parts[0] + '.setupDone', refreshStatus);
      scope.$watchCollection(parts[0] + '.setupViewed', refreshStatus);

      function refreshStatus() {
        var org = scope.$eval(parts[0]);

        elem.removeClass('label-success label-warning label-danger');
        if (org.setupDone && -1 !== _.indexOf(org.setupDone, type)) {
          elem.addClass('label-success');
        }
        else if (org.setupViewed && -1 !== _.indexOf(org.setupViewed, type)) {
          elem.addClass('label-warning');
        }
        else {
          elem.addClass('label-danger');
        }
      }
    }
  }
}
