'use strict';

angular
	.module('isa.addressbook')
	.config(isaCheckbox);

function isaCheckbox(formlyConfigProvider) {

  formlyConfigProvider.setWrapper({
    name: 'isaCheckboxLabel',
    templateUrl: 'client/addressBook/form/isaCheckboxLabel.ng.html'
  });

  formlyConfigProvider.setType({
    name: 'isaCheckbox',
    templateUrl: 'client/addressBook/form/isaCheckbox.ng.html',
    wrapper: [ 'isaCheckboxLabel' ]
  });

}
