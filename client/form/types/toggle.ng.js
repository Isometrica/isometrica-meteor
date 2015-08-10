angular
  .module('isa.form.types')
  .config(toggleType);

function toggleType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaToggle',
    templateUrl: 'client/form/types/toggle.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError']
  });
}
