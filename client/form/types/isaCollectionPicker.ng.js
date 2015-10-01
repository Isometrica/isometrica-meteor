angular
  .module('isa.form.types')
  .config(isaCollectionPicker)
  .controller('isaCollectionPickerController', isaCollectionPickerController);

function isaCollectionPicker(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaCollectionItem',
    templateUrl: function() {
      return 'client/form/types/isaCollectionPicker.ng.html';
    },
    wrapper: ['hzLabel', 'isaHasError'],
    controller: 'isaCollectionPickerController'
  });
}

/**
 * Controller for collection picker fields. Requirements:
 *
 * - Take a set of collection names.
 * - Present data from those collections.
 * - Yeild an aggregate of an item in those collection to the consumer
 *   when selected.
 *
 * @author Steve Fortune
 */
function isaCollectionPickerController($scope, $meteor) {

  var collections = _.map($scope.to.collectionNames, function(col) {
    return $meteor.getCollectionByName(col);
  });

  $scope.format = $scope.format || function(i) { return i; };
  var yieldFn = $scope.yieldFn || function(o) { return o.name; };

  $scope.$meteorAutorun(function() {
    $scope.list = Array.prototype.concat.apply([], _.map(collections, function(col) {
      return col.find({}).map(function(doc) {
        return _.extend(yieldFn(doc, col._name), { colName: col._name });
      });
    }));
  });

}
