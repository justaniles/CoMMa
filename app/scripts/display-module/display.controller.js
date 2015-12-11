'use strict';

angular.module("displayModule")

.controller("DisplayController", function($scope, displayService) {

  $scope.history = displayService.getHistory();

  /**
   * [updateHistory - Listen for history changes]
   *
   * Listen for history changes in the displayService and update this
   * controller's $scope.history accordingly.
   *
   * @param  {Array} newHis - new history array.
   */
  displayService.on("historychange", function updateHistory(newHis) {
    $scope.history = newHis;
  });

});
