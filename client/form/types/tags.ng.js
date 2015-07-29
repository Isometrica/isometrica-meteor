angular
  .module('isa.form.types')
  .config(tagsType);

function tagsType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaTags',
    templateUrl: 'client/form/types/tags.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError'],
    controller: tagsController
  });

}

tagsController.$inject = ['$scope', '$log'];
function tagsController($scope, $log) {
  $scope.lookupFn = function() {
    var parent = $scope.$parent;
    while (parent) {
      if (parent.loadTags) {
        return parent.loadTags.apply(parent, arguments);
      }

      parent = parent.$parent;
    }

    $log.debug("loadTags not found in parent scope, aborting");
    return [];
  };
}
