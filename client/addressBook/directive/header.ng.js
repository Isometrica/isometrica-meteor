'use strict';

angular
  .module('isa.addressbook')
  .directive('isaAddressBookHeader', isaAddressBookHeaderDirective);

/**
 * @author Steve Fortune
 */
function isaAddressBookHeaderDirective() {
  return {
    templateUrl: 'client/addressBook/view/header.ng.html',
    restrict: 'AE',
    scope: {
      selectState: '=',
      organisation: '='
    }
  };
}
