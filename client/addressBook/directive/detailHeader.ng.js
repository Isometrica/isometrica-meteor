'use strict';

angular
	.module('isa.addressbook')
	.directive('isaAddressBookDetailHeader', isaAddressBookDetailHeaderDirective);

/**
 * @author Steve Fortune
 */
function isaAddressBookDetailHeaderDirective() {
	return {
		templateUrl: 'client/addressBook/view/detailHeader.ng.html',
		restrict: 'E',
    replace: true,
		scope: {
			onEdit: '&',
			title: '@'
		}
	};
}
