'use strict';

angular.module("commaApp", [
  "ngRoute",
  "ngAnimate",
  "displayModule",
  "keywordModule",
  "stringParserModule"
])
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'DisplayController',
  })
  .otherwise({
    redirectTo: '/'
  });
})
.run(function(displayService) {
  // Display startup message
  displayService.print([
    "Hello! My name is CoMMa (aka Conversational Music Maker). ",
    "You can ask me to create music or sounds using natural language! \n",
    "Type 'help' to see a list of all valid keywords."
  ].join(""));
});
