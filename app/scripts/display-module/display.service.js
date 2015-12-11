'use strict';

angular.module("displayModule")

.service("displayService", function() {
  var history = [];
  var events = {};

  this.print = function print(str) {
    this.addToHistory(str);
  };

  /*==================================================
   * History Functions:
   *==================================================*/
  this.addToHistory = function addToHistory(obj) {
    history.push(obj);
    this.trigger("historychange", history);
  };

  this.clearHistory = function clearHistory() {
    history.length = 0;
    this.trigger("historychange", history);
  };

  this.getHistory = function getHistory() {
    return history;
  };


  /*==================================================
   * Event Functions:
   *==================================================*/
  /**
   * [on description]
   * @param  {[type]} evt [description]
   * @param  {Function} fn [description]
   * @return {[type]} [description]
   */
  this.on = function on(evt, fn) {
    if (!events.hasOwnProperty(evt)) {
      events[evt] = [];
    }
    events[evt].push(fn);
  };

  this.off = function off(evt, fn) {
    if (!events.hasOwnProperty(evt)) {
      return false;
    }
    else if (typeof fn === "undefined") {
      delete events[evt];
    }
    else {
      var index = events[evt].indexOf(fn);
      if (index !== -1) {
        events[evt].splice(index, 1);
      }
    }
  };

  this.trigger = function trigger(evt, data) {
    if (!events.hasOwnProperty(evt)) {
      return false;
    }
    events[evt].forEach(function(fn) {
      fn.call(this, data);
    }.bind(this));
  };
});
