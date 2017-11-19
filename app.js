'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ui.router',
  'header',
  'draw',
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

  .state('test', {
    url: '/test',
    templateUrl: 'dist/view/test.html',
    controller: 'testDiagramaController'
  });;


 // $routeProvider.otherwise({redirectTo: '/'});
}]);
