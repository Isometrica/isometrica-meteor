angular
  .module('isa.form.wrappers')
  .config(isaRefLabelWrapper);

/**
 * Wrapper for an input that displays the model's reference
 * number by its side. Assumes that the reference number exists
 * as a value in the model paired with the `referenceNo` key.
 *
 * @see model/risks.js
 */
function isaRefLabelWrapper(formlyConfigProvider) {
  formlyConfigProvider.setWrapper({
    name: 'isaRefLabel',
    templateUrl: 'client/form/wrappers/isaRefLabel.ng.html'
  });
}
