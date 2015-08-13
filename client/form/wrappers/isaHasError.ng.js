angular
  .module('isa.form.wrappers')
  .config(isaHasErrorWrapper);

function isaHasErrorWrapper(formlyConfigProvider) {
  formlyConfigProvider.setWrapper({
    name: 'isaHasError',
    templateUrl: 'client/form/wrappers/isaHasError.ng.html'
  });
}
