angular
  .module('isa.form.types')
  .config(isaInputType);

function isaInputType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaInput',
    extends: 'input',
    wrapper: [ 'clearBtn', 'hzLabel', 'bootstrapHasError']
  });
  formlyConfigProvider.setType({
    name: 'isaTextarea',
    extends: 'textarea',
    wrapper: [ 'hzLabel', 'bootstrapHasError']
  });
  formlyConfigProvider.setType({
    name: 'isaSelect',
    extends: 'select',
    wrapper: ['hzLabel', 'bootstrapHasError']
  });
}
