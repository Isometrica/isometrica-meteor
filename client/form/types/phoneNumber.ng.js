angular
  .module('isa.form.types')
  .config(phoneNumberType);

function phoneNumberType(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaPhoneNumber',
    templateUrl: 'client/form/types/phoneNumber.ng.html',
    wrapper: [ 'bootstrapHasError' ]
  });
}
