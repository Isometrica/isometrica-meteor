angular
  .module('isa.directives')
  .directive('dlgHeader', dlgHeaderDirective);

function dlgHeaderDirective() {
  return {
    restrict: 'E',
    templateUrl: 'client/app/directives/dlgHeader.ng.html',
    scope: {
      cancel: '&',
      done: '&',
      title: '@',
      textId: '@'
    }
  };
}
