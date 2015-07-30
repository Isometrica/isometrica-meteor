angular
  .module('isa.form.wrappers')
  .config(clearBtnWrapper);

function clearBtnWrapper(formlyConfigProvider) {
  formlyConfigProvider.setWrapper({
    name: 'clearBtn',
    templateUrl: 'client/form/wrappers/clearBtn.ng.html'
  });
}
