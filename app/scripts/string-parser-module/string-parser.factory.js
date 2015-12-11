'use strict';
angular.module("stringParserModule")

.factory("stringParserFactory", function() {
  /**
   * [StringParser - object definition]
   * @param {String} str - String from which a StringParser
   *                     should be built.
   */
  function StringParser(str) {
    this.index = 0;
    this.rawString = "";
    this.strArray = [];
    if (typeof str === "string") {
      this.rawString = str;
      this.strArray = decomposeString(str);
    }
    else if (Object.prototype.toString.call(str) === '[object Array]') {
      this.rawString = str.join(" ");
      this.strArray = str;
    }
    else {
      console.error("Unsupported type of str: %s", typeof(str));
    }
  }
  StringParser.prototype.setIndex = function setIndex(val) {
    if (typeof val === "string") {
      val = this.strArray.indexOf(val);
    }
    if (typeof val !== "number") {
      console.error("ERROR typeof val must either be a string or number");
      return;
    }
    this.index = val;
  };
  StringParser.prototype.contains = function contains(outerStr, fn) {
    function containsHelper(str) {
      var array = decomposeString(str);
      if (array.length === 0) {
        console.warn("Caution: string of no length passed to contains");
        return false;
      }
      // Check if this is just a word:
      else if (array.length === 1) {
        if (this.strArray.indexOf(array[0]) !== -1) {
          return true;
        }
        return false;
      }
      // We're searching for a phrase:
      else {
        var currentIndex = 0;
        while (currentIndex < this.strArray.length) {
          // Use native indexOf to search for first word in phrase
          currentIndex = this.strArray.indexOf(array[0], currentIndex);
          if (currentIndex === -1) {
            return false;
          }
          else {
            // First word was found, now we need to see if subsequent words
            // match exactly. Only if an exact match of the entire phrase
            // exists in order do we return true.
            var exactMatch = true;
            array.forEach(function(word, subIndex) {
              if (word !== this.strArray[currentIndex + subIndex]) {
                exactMatch = false;
              }
            });
            if (exactMatch) {
              return true;
            }
          }
        }
      }
    }
    var result = containsHelper.call(this, outerStr);
    // Check if we have a callback function provided:
    if (typeof fn !== "undefined") {
      if (result) {
        fn.call(this);
      }
      return this;
    }
    // Otherwise, just return the boolean result directly
    return result;
  };
  StringParser.prototype.prefix = function prefix() {
    return new StringParser(this.strArray.slice(0, this.index));
  };
  StringParser.prototype.suffix = function suffix() {
    return new StringParser(
      this.strArray.slice(this.index+1, this.strArray.length));
  };
  StringParser.prototype.size = function size() {
    return this.strArray.length;
  };
  StringParser.prototype.toString = function stringParserToString() {
    return this.rawString;
  };
  function decomposeString(str) {
    return str.replace(/[^\w\s]/g, "").split(" ");
  }


  function create(phrase, indexLocation) {
    var sp = new StringParser(phrase);
    if (typeof indexLocation !== "undefined") {
      sp.setIndex(indexLocation);
    }
    return sp;
  }

  /*==============================
   * Publicly Exposed Functions:
   *==============================*/
  return {
    create: create
  };
});
