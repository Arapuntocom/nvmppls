'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ui.router',
  'dibujo'
])

.config(['$locationProvider', '$routeProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $routeProvider, $stateProvider, $urlRouterProvider) {
   $locationProvider.hashPrefix('!');
  $urlRouterProvider.otherwise("/");
  $stateProvider

  .state('dibujo', {
    url: '/',
    templateUrl: 'dist/view/dibujo.html',
    controller: 'DibujoController'
  })

  $routeProvider.otherwise({redirectTo: '/'});
}]);
