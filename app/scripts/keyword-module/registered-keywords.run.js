'use strict';
angular.module("keywordModule")

.run(function(displayService, keywordService, stringParserFactory) {

  keywordService.registerKeyword(
    ["hello","hi","sup"],
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
