angular
  .module('isa.form.wrappers')
  .config(hzLabelWrapper);

function hzLabelWrapper(formlyConfigProvider) {
  formlyConfigProvider.setWrapper({
    name: 'hzLabel',
    templateUrl: 'client/form/wrappers/hzLabel.ng.html'
  });
}
