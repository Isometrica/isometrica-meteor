'use strict';

angular
  .module('isa.addressbook')
  .config(isaNotes);

function isaNotes(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaNotes',
    wrapper: [ 'hzLabel' ],
    extends: 'isaRichText'
  });
}
