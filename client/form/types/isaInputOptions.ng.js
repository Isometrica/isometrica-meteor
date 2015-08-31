angular
  .module('isa.form.types')
  .config(isaInputOptionsType);

function isaInputOptionsType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaInputOptions',
    templateUrl: 'client/form/types/isaInputOptions.ng.html',
    wrapper: ['hzLabel', 'bootstrapHasError']
  });
}
