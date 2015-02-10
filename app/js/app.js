var pitchApp = angular.module('pitchApp', ['ngRoute', 'pitchControllers']);

pitchApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/game', {
        templateUrl: 'templates/game-start.html',
        controller: 'GameRecordController'
      }).
      when('/record', {
        templateUrl: 'templates/game-record.html',
        controller: 'GameRecordController'
      }).
      when('/recap', {
        templateUrl: 'templates/game-recap.html',
        controller: 'GameRecapController'
      }).
      otherwise({
        redirectTo: '/record'
      });
  }]);