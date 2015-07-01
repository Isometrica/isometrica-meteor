'use strict';

var app = angular.module('isa');

app.controller('BaseController', ['$scope', '$state', '$timeout', function($scope, $state, $timeout) {

    //when a user signs in redirect to the overview page
    Accounts.onLogin( function() {

        $timeout(function(){
            $state.go('overview');
        }, 0);

    });

}]);