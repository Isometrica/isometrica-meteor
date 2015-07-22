angular
  .module('isa.form.types')
  .config(yesNoType);

function yesNoType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaYesNo',
    templateUrl: 'client/form/types/yesNo.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError']
  });
}
