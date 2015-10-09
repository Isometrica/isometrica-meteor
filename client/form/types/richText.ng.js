angular
  .module('isa.form.types')
  .config(richTextType);

function richTextType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaRichText',
    templateUrl: 'client/form/types/richText.ng.html',
    controller: richTextController,
    defaultOptions: {
      templateOptions: {
        taToolbar: "[['bold','italics'],['ul','ol'],['undo'],['insertLink','insertImage']]"
      }
    }
  });
}

richTextController.$inject = ['$scope'];
function richTextController($scope) {
  $scope.htmlCleanup = isa.utils.htmlCleanup;
}
