
var app = angular.module('isa');

app.config( function($provide, $stateProvider, $urlRouterProvider) {

    $stateProvider


        .state('welcome', {
            url: '/welcome',
            templateUrl : 'client/components/home/home.ng.html',
            controller : 'HomeController'
        })

        /*
        .state('login', {
            url: '/login',
            templateUrl: 'components/login/loginView.html',
            controller : 'LoginController'
        })
        .state('authorized', {
            abstract: true,
            template: '<ui-view/>',
            resolve: {
                CurrentUser: ['Identity', function(Identity) {
                    console.log("Finding current user");
                    return Identity.get().then(function(user) {
                        console.log(user);
                        return user;
                    });
                }]
            },
            data : {
                anonymous: false
            }
        })
        .state('overview', {
            url: '/overview',
            parent: 'authorized',
            templateUrl: '/components/overview/view/overviewView.html',
            controller: 'OverviewController',
        })
        .state('planUsers', {
            url : '/plan/:planId/users',
            templateUrl : 'components/planUsers/planUsersView.html',
            controller : 'PlanUsersController',
            parent: 'authorized'
        })
        .state('canvas', {
            url: '/canvas/:planId',
            templateUrl: 'components/canvas/canvasView.html',
            controller : 'CanvasController',
            parent: 'authorized'
        })
        .state('userActivity', {
            url: '/user/:userId/activity',
            templateUrl: 'components/userActivity/userActivityView.html',
            controller : 'UserActivityController',
            parent: 'authorized'
        })*/

    /**
     * This is the parent route for all modules. It defines a url with the required
     * organisation and module identifiers.
     */
        /*
        .state('module', {
            url : '/organisation/:orgId/module/:moduleId',
            parent: 'authorized',
            abstract: true,
            template: '<ui-view/>',
            resolve: {
                module: ['ModuleService', '$stateParams', function(ModuleService, $stateParams) {
                    return ModuleService.findById($stateParams.moduleId);
                }]
            }
        })
*/

    $urlRouterProvider.otherwise('/welcome');

} );
