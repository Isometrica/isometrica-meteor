angular
  .module('isa.form.types')
  .config(richTextType);

function richTextType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaRichText',
    templateUrl: 'client/form/types/richText.ng.html',
    controller: richTextController
  });
}

function richTextController($scope) {
  $scope.htmlCleanup = isa.utils.htmlCleanup;
}
