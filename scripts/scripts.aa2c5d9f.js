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

angular.module("displayModule", []);

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

angular.module("keywordModule", []);

'use strict';
angular.module("keywordModule")

.service("keywordService", function(displayService) {
  var registeredKeywords = {};

  this.registerKeyword = function registerKeyword(keywords, desc, fn) {
    if (Object.prototype.toString.call(keywords) !== '[object Array]') {
      keywords = [ keywords ];
    }
    keywords.forEach(function(kw, index) {
      if (!registeredKeywords.hasOwnProperty(kw)) {
        registeredKeywords[kw] = [];
      }
      // Only the first keyword gets the description, the rest become
      // aliases for the first keyword.
      if (index === 0) {
        registeredKeywords[kw].push({
          description: desc,
          function: fn
        });
      }
      else {
        registeredKeywords[kw].push({
          description: "Alias for " + keywords[0],
          function: fn
        });
      }
    });
  };

  this.triggerKeyword = function triggerKeyword(keyword, data) {
    if (!registeredKeywords.hasOwnProperty(keyword)) {
      return;
    }

    registeredKeywords[keyword].forEach(function(kwInfo) {
      kwInfo.function.call(this, data);
    }.bind(this));
  };

  this.parseForKeywords = function parseForKeywords(phrase) {
    var validCommand = false;
    phrase = phrase.toLowerCase();
    for (var kw in registeredKeywords) {
      var i = phrase.indexOf(kw);
      var len = kw.length;
      // Only trigger keyword if the exact word is found.
      // i.e. "beat" will NOT be found in "beats"
      if (i !== -1 &&
        (i + len >= phrase.length ||
          phrase.charAt(i+len) === ' ')) {
        this.triggerKeyword(kw, phrase);
        validCommand = true;
      }
    }

    if (!validCommand) {
      displayService.print("No valid command recognized");
    }
  };

  // Register help message to display all available keywords
  this.registerKeyword("help", "Display all available commands", function(phrase) {
    var helpOutput = [
      "List of available keywords:\n"
    ];
    for (var kw in registeredKeywords) {
      var desc = registeredKeywords[kw][0].description;
      desc = (desc === "" ? "No description provided" : desc);

      helpOutput.push([
        "\t",
        kw + " - " + desc,
        "\n"
      ].join(""));
    }
    displayService.print(helpOutput.join(""));
  });
});

'use strict';
angular.module("keywordModule")

.run(function(displayService, keywordService, stringParserFactory) {

  keywordService.registerKeyword(
    ["hello"],
    "Nice pleasantries",
    function(entirePhrase) {

    // Print random greeting:
    var greetings = [
      "Top o' the morning to you!",
      "Why hello yourself!",
      "Hello and welcome!",
      "Hi!"
    ];
    displayService.print(greetings[Math.floor(Math.random() * greetings.length)]);
  });


  keywordService.registerKeyword(
    "beat",
    "Functionality not currently supported",
    function(entirePhrase) {

    var stringParser = stringParserFactory.create(entirePhrase, "beat");
    var prefix = stringParser.prefix();
    var response = "How's this?";
    prefix
    .contains("random", function() {
      response = "Boo beep beep bo bop making beat";
    })
    .contains("sick", function() {
      response = "Is this sickly enough for you?";
    });
    displayService.print(response);
  });


  keywordService.registerKeyword(
    "clear",
    "Clear the console window",
    function(entirePhrase) {

      var sp = stringParserFactory.create(entirePhrase);
      if (sp.size() === 1) {
        displayService.clearHistory();
      }
    }
  );


  keywordService.registerKeyword(
    "set tempo",
    "Set the playback tempo, in BPS (beats per second)",
    function(phrase) {

      var sp = stringParserFactory.create(phrase, "tempo");
      var numbers = sp.suffix().extractNumbers();
      var tempo = 1; //default tempo
      if (numbers.length > 0) {
        tempo = numbers[0];
      }

      var response = [
        "Enter the following into the Supercollider server:\n",
        "\tq.setTempo(" + tempo + ")"
      ].join("");
      displayService.print(response);
    }
  );


  keywordService.registerKeyword(
    "play",
    "Resume playback, if playback is paused",
    function(phrase) {
      var response = [
        "Enter the following into the Supercollider server:\n",
        "\tq.playAll()"
      ].join("");
      displayService.print(response);
    }
  );


  keywordService.registerKeyword(
    "pause",
    "Pause all playback",
    function(phrase) {
      var response = [
        "Enter the following into the Supercollider server:\n",
        "\tq.pauseAll()"
      ].join("");
      displayService.print(response);
    }
  );


  keywordService.registerKeyword(
    "reset",
    "Stop and remove all added sounds",
    function(phrase) {
      var response = [
        "Enter the following into the Supercollider server:\n",
        "\tq.clear()"
      ].join("");
      displayService.print(response);
    }
  );


  keywordService.registerKeyword(
    ["hihat", "hi-hat"],
    "Produce a traditional hi-hat sound",
    function(phrase) {

      var response =
        "Enter the following into the Supercollider server:\n";

      var beat = "quarter";
      var sp = stringParserFactory.create(phrase);
      sp
      .contains("whole", function(index) {
        beat = "whole";
      })
      .contains("half", function(index) {
        beat = "half";
      })
      .contains("quarter", function(index) {
        beat = "quarter";
      })
      .contains("sixteenth", function(index) {
        beat = "sixteenth";
      })
      .contains("thirtysecond", function(index) {
        beat = "thirtysecond";
      });

      response += [
        "\tbeat = '" + beat + "'\n",
        "\tsound = 'hihat'"
      ].join("");

      displayService.print(response);
    }
  );


  keywordService.registerKeyword(
    ["basskick", "bassdrum"],
    "Produces a traditional bass drum sound",
    function(phrase) {

      var response =
        "Enter the following into the Supercollider server:\n";

      var beat = "quarter";
      var sp = stringParserFactory.create(phrase);
      sp
      .contains("whole", function(index) {
        beat = "whole";
      })
      .contains("half", function(index) {
        beat = "half";
      })
      .contains("quarter", function(index) {
        beat = "quarter";
      })
      .contains("sixteenth", function(index) {
        beat = "sixteenth";
      })
      .contains("thirtysecond", function(index) {
        beat = "thirtysecond";
      });

      response += [
        "\tbeat = '" + beat + "'\n",
        "\tsound = 'basskick'"
      ].join("");

      displayService.print(response);
    }
  );
});

angular.module("stringParserModule", []);

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
  StringParser.prototype.extractNumbers = function extractNumbers() {
    var numbers = [];
    this.strArray.forEach(function(word) {
      if (!isNaN(word)) {
        numbers.push(parseInt(word, 10));
      }
    });
    return numbers;
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
