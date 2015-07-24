'use strict';

var app = angular.module('isa');

app.run(['$rootScope', '$state', '$stateParams',
    function($rootScope, $state, $stateParams) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {

            /*
             * If the to-state is guarded and the user not authenticated: redirect to welcome page
             */
            var isStateGuarded = toState.data && toState.data.anonymous === false;
            var isAuthenticated = $rootScope.currentUser;

            if (isStateGuarded && !isAuthenticated) {
                event.preventDefault();
                $state.go("welcome");
            }

        });

        $rootScope.$state = $state;
    }
]);
