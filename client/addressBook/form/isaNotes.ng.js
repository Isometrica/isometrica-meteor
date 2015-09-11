'use strict';

angular
  .module('isa.addressbook')
  .config(isaNotes);

function isaNotes(formlyConfigProvider) {
  formlyConfigProvider.setType({
    defaultOptions: {
      className: 'isa-notes-border'
    },
    name: 'isaNotes',
    wrapper: [ 'hzLabel' ],
    extends: 'isaRichText'
  });
}
