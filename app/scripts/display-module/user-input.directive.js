'use strict';

angular.module("displayModule")

.directive("userInput", function($timeout, displayService, keywordService) {
  return {
    restrict: "E",
    link: function($scope, $element, $attrs) {

      var inputTextBox = $element.find(".user-input-textbox");
      $scope.prompt = "> ";

      /**
       * [processKeyPresses Listen for enter key]
       *
       * This function is called whenever a key is pressed while
       * the inputTextBox has focus. If the enter key is pressed,
       * then we process the command and add it to history.
       *
       * @param  {[type]} event [description]
       * @return {[type]} [description]
       */
      $scope.processKeyPresses = function processKeyPresses(event) {
        var phrase = $scope.userInputString;
        if (event.keyCode === 13) {
          displayService.addToHistory($scope.prompt + phrase);
          keywordService.parseForKeywords(phrase);
          reset();
        }
      };

      function reset() {
        $scope.userInputString = "";
        $timeout(function() {
          $element.get(0).scrollIntoView();
        });
      }

      // Clicking body gives the inputTextBox focus
      $("html").click(function() {
        inputTextBox.focus();
      });
      // Give inputTextBox focus upon page load
      $timeout(function() {
        inputTextBox.focus();
      });
    },
    templateUrl: "scripts/display-module/user-input.html"
  };
});
