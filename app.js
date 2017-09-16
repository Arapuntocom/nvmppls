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

  .state('inicio', {
    url: '/',
    templateUrl: 'dist/view/add.html' 
  })

  .state('draw', {
    url: '/draw',   
    templateUrl: 'dist/view/draw.html'
  })

  .state('dibujo', {
    url: '/dibujo',
    templateUrl: 'dist/view/dibujo.html',
    controller: 'DibujoController'
  })

  .state('test', {
    url: '/test',
    templateUrl: 'dist/view/test.html',
    controller: 'DibujoController'
  });;


 // $routeProvider.otherwise({redirectTo: '/'});
}]);
