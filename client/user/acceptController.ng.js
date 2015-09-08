'use strict';

angular
  .module('isa.user')
  .controller('AcceptController', AcceptController);

function AcceptController(isaAccept) {
  isaAccept.accept();
}
