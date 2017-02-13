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
  describe("Flow", function() {
    var app = {};
    state.addStateToApp(app);

    it("verify basic Flow functions", function() {
      var flow = new state.Flow();
      expect(flow.getName()).to.equal("");
      expect(flow.getParentFlow()).to.equal(undefined);
    });
    it("verify simple linkage Flow functions", function() {
      var flow = new state.Flow();
      var subFlow = new state.Flow("BUY_FOOD");
      flow.addSubFlow(subFlow);
      expect(subFlow.getName()).to.equal("BUY_FOOD");
      expect(subFlow.getParentFlow()).to.equal(flow);
    });
    it("verify deep linkage Flow functions", function() {
      var flow = new state.Flow();
      var subFlow1 = new state.Flow("BUY_FOOD");
      var subFlow2 = new state.Flow("PICK_RECIPIES");
      var subSubFlow1 = new state.Flow("DINNER");
      flow.addSubFlow(subFlow1);
      flow.addSubFlow(subFlow2);
      subFlow2.addSubFlow(subSubFlow1);
      expect(subFlow1.getName()).to.equal("BUY_FOOD");
      expect(subFlow1.getParentFlow()).to.equal(flow);
      expect(subFlow2.getName()).to.equal("PICK_RECIPIES");
      expect(subFlow2.getParentFlow()).to.equal(flow);
      expect(subSubFlow1.getFullUpstreamName()).to.equal("PICK_RECIPIES.DINNER");
    });
    it("verify Flow parsing", function() {
      var flow = state.Flow.parseFlow("FOO.BAR.BLAH");
      expect(flow.getName()).to.equal("");
      expect(flow.subFlows[0].getName()).to.equal("FOO");
      expect(flow.subFlows[0].subFlows[0].getName()).to.equal("BAR");
      expect(flow.subFlows[0].subFlows[0].subFlows[0].getName()).to.equal("BLAH");
      expect(flow.subFlows[0].subFlows[0].subFlows[0].getFullUpstreamName()).to.equal("FOO.BAR.BLAH");

      expect(flow.hasSubFlow()).to.equal(true);
      expect(flow.subFlows[0].hasSubFlow()).to.equal(true);
      expect(flow.subFlows[0].subFlows[0].hasSubFlow()).to.equal(true);
      expect(flow.subFlows[0].subFlows[0].subFlows[0].hasSubFlow()).to.equal(false);
    });

  });

});
