var pitchApp = angular.module('pitchApp', ['ngRoute', 'pitchControllers']);

pitchApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/record', {
        templateUrl: 'templates/game-record.html',
        controller: 'GameRecordController'
      }).
      when('/recap', {
        templateUrl: 'templates/game-recap.html',
        controller: 'GameRecapController'
      }).
      when('/random', {
        templateUrl: 'templates/random.html',
        controller: 'RandomController'
      }).
      otherwise({
        redirectTo: '/record'
      });
  }]);