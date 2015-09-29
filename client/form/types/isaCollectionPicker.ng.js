angular
  .module('isa.form.types')
  .controller('isaCollectionPickerController', isaCollectionPickerController);

/**
 * Controller for collection picker fields. Requirements:
 *
 * - Take a set of collection names.
 * - Present data from those collections.
 * - Yeild an aggregate of an item in those collection to the consumer
 *   when selected.
 *
 * Pass the following to the scope:
 *
 * - cols: an array of collections to aggregate by their name
 * - transformFn: a transform function to pass to the collection.find
 *   queries.
 * - yeildTransform: a function that transforms an item once its
 *   been selected in preparation for yielding.
 *
 * @author Steve Fortune
 */
function isaCollectionPickerController($scope, $meteor) {

  var collections = _.map($scope.cols, function(col) {
    return $meteor.getCollectionByName(col);
  });

  $scope.$meteorAutorun(function() {
    $scope.list = _.map(collections, function(col) {
      return col.find({}, { transform: $scope.transformFn }).fetch();
    }).concat();
  });

  var setModel = function(value) {
    $scope.model[$scope.options.key] = value;
  }

  $scope.yeildItem = function(item) {
    if ($scope.yeildTransform) {
      item = $scope.yeildTransform(item);
    }
    setModel(item);
  };

}
