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
