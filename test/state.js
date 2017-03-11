/*
MIT License

Copyright (c) 2017 Ilya Shubentsov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var expect = require("chai").expect;
var state = require("../index.js");

describe("vui-state", function() {
  describe("State", function() {
    var app = {};
    state.addStateToApp(app);

    it("verify State parsing and to string functions", function() {
      var toParse1 = "{\"currentFlow\":\"\",\"lastPrompt\":\"\",\"gatheredAnswers\":{},\"autoIncrementPrompts\":false,\"promptCounts\":{}}";
      var toParse2 = "{\"currentFlow\":\"SAMPLE.FLOW\",\"lastPrompt\":\"\",\"gatheredAnswers\":{},\"autoIncrementPrompts\":false,\"promptCounts\":{}}";
      var toParse3 = "{\"currentFlow\":\"\",\"lastPrompt\":\"SAMPLE.FLOW.PROMPT\",\"gatheredAnswers\":{},\"autoIncrementPrompts\":false,\"promptCounts\":{}}";
      var toParse4 = "{\"currentFlow\":\"SAMPLE.FLOW\",\"lastPrompt\":\"SAMPLE.FLOW.PROMPT\",\"gatheredAnswers\":{},\"autoIncrementPrompts\":false,\"promptCounts\":{}}";
      var toParse5 = "{\"currentFlow\":\"SAMPLE.FLOW\",\"lastPrompt\":\"SAMPLE.FLOW.PROMPT\",\"gatheredAnswers\":{\"SAMPLE\":{\"FLOW\":{\"PROMPT\":\"simple string value\",\"ANOTHER_PROMPT\":42,\"THIRD_PROMPT\":\"UNIVERSAL_ANSWER\"}}},\"autoIncrementPrompts\":false,\"promptCounts\":{}}";
      expect(app.State.parseState(toParse1).toString()).to.equal(toParse1);
//      console.log(JSON.stringify(app.State.parseState(toParse5), null, 2));
//      console.log(app.State.parseState(toParse5).toString());
      expect(app.State.parseState(toParse2).toString()).to.equal(toParse2);
      expect(app.State.parseState(toParse3).toString()).to.equal(toParse3);
      expect(app.State.parseState(toParse4).toString()).to.equal(toParse4);
      expect(app.State.parseState(toParse5).toString()).to.equal(toParse5);
    });

    it("verify State get/set current flow functions", function() {
      var rawToken = " asdf . adf f adfafa . asd";
      var scratchState = new app.State();
      scratchState.setCurrentFlow(rawToken);
      expect(scratchState.getCurrentFlow()).to.equal("ASDF.ADF_F_ADFAFA.ASD");
      var stateWithValues = new app.State();
      stateWithValues.setCurrentFlow("TEST.FLOW");
      stateWithValues.setLastPrompt("TEST.FLOW.PROMPT");
      stateWithValues.setAnswer("TEST.FLOW.PROMPT", "simple string value");
      stateWithValues.setAnswer("TEST.FLOW.ANOTHER_PROMPT", 42);
      stateWithValues.setAnswer("TEST.FLOW.THIRD_PROMPT", "UNIVERSAL_ANSWER");
      stateWithValues.clearAnswer("TEST.FLOW.THIRD_PROMPT");
      stateWithValues.clearAnswer("TEST.NON_EXISTANT_FLOW.THIRD_PROMPT");
      stateWithValues.setAnswer("TEST.FLOW.OLD_STATE", scratchState);
      stateWithValues.setAnswer("TEST.FLOW2.PROMPT_BLAH", "blah");
      stateWithValues.setAnswer("", "Answer without a token");
      stateWithValues.incrementPromptedCount("TEST.Flow.prompt1");
      stateWithValues.incrementPromptedCount("TEST.Flow.prompt1");
      stateWithValues.incrementPromptedCount("TEST.Flow.prompt2");
      stateWithValues.resetPromptedCount("TEST.Flow.prompt2");
//      console.log(stateWithValues.getPromptedCount("TEST.Flow.prompt1"));
//      console.log(stateWithValues.getPromptedCount("TEST.Flow.prompt2"));
      console.log(stateWithValues.promptCounts.TEST.FLOW.PROMPT2);

//      console.log("stateWithValues:", JSON.stringify(stateWithValues, null, 2));
      stateWithValues.enablePromptCountAutoIncrement();
//      console.log("stateWithValues:", JSON.stringify(stateWithValues, null, 2));
      stateWithValues.setLastPrompt("TEST.FLOW.PROMPT");
//      console.log("stateWithValues:", JSON.stringify(stateWithValues, null, 2));
//      console.log("toString: " + stateWithValues.toString());

      expect(stateWithValues.gatheredAnswers.TEST.FLOW.PROMPT).to.equal("simple string value");
      expect(stateWithValues.getAnswer("TEST.FLOW.PROMPT")).to.equal("simple string value");
      expect(stateWithValues.getAnswer("   ")).to.equal(undefined);
      var restoredState = new app.State();
      restoredState = state.State.parseState(stateWithValues.toString());
      expect(restoredState.toString()).to.equal(stateWithValues.toString());
    });

    it("verify StateToken isChild function", function() {
      var parentToken = "PARENT.OF.THIS";
      var childToken = " paRent . of . this . child   ";
      expect(app.State.isChildToken(parentToken, childToken)).to.equal(true);
    });

  });
});
