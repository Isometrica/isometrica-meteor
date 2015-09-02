'use strict';

angular
	.module('isa.addressbook')
	.config(isaInvitation);

function isaInvitation(formlyConfigProvider) {

  formlyConfigProvider.setWrapper({
    name: 'isaInvitationLabel',
    templateUrl: 'client/addressBook/form/isaInvitationLabel.ng.html'
  });

  formlyConfigProvider.setType({
    name: 'isaInvitation',
    extends: 'input',
    wrapper: [ 'isaInvitationLabel' ]
  });

}
