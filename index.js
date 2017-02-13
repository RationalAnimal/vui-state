/*
@author Ilya Shubentsov

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
'use strict'
var state = {};
var session = require("vui-session");

/**
 * Call this function to add vui-state functionality to
 * any object.  Note that technically the functionality will be added to the
 * session object, but the app will have "direct" functions to access the state.
 * Also note that app is assumed to have vui-session functionality added as well.
 * To ensure that this is so, vui-session is added as part of the setup here.
 * @param {object} app - The object to which the functionality should be added.
 */
state.addStateToApp = function(app){
  if(app.stateAlreadyAdded == true){
    return;
  }
  app.stateAlreadyAdded = true;
  session.addSessionToApp(app);
};

/**
* Constructor for a State object.  Initializes everything to empty values.
* flow - this is the current app flow.  It is a hierarchical js object that
* includes an instance of a flow object as a subflow.
* getheredAnswers - these are answers gathered from the user.  The answers are
* stored by flow as well as "common" answers that apply to all flows.  Common
* answers are stored under empty (i.e. "") flow name.
*/
state.State = function(){
  this.clear();

  this.clear = function(){
    this.flow = new Flow();
    this.gatheredAnswers = {};
  }
}

state.Flow = function(name){
  if(typeof name != "string"){
    this.name = "";
  }
  else {
    this.name = name;
  }
  this.subFlows = [];
  this.getName = function(){
    return this.name;
  }
  this.setName = function(name){
    if(typeof name != "string" || name.indexOf(".") >= 0 || name.trim() == ""){
      return;
    }
    this.name = name;
  }

  this.getParentFlow = function(){
    return this.parentFlow;
  }
  this.getFullUpstreamName = function(){
    if(state.Flow.isFlow(this.getParentFlow())){
      var parentsFullName = this.getParentFlow().getFullUpstreamName();
      if(parentsFullName == ""){
        return this.getName();
      }
      return  parentsFullName + "." + this.getName();
    }
    return this.getName();
  }

  this.hasSubFlow = function(){
    if(this.subFlows.length > 0){
      return true;
    }
    return false;
  }

  /**
  * Call to add the subFlow to be the list of subFlows.  Ignores subFlows that
  * have name composed of whitespaces only.
  */
  this.addSubFlow = function(subFlow){
    if(state.Flow.isFlow(subFlow)){
      var subFlowName = subFlow.getName().trim();
      if(subFlowName != ""){
        this.subFlows.push(subFlow);
        subFlow.parentFlow = this;
      }
    }
  }
}

/**
* Call this function to convert a string into Flow object. Ignores sub flows
* whose names are white spaces.
*/
state.Flow.parseFlow = function(stringToParse){
  var returnValue = new state.Flow();
  if(typeof stringToParse == "string"){
    var scratch = returnValue;
    var parts = stringToParse.split(".");
    for(var i = 0; i < parts.length; i ++){
      var trimmedName = parts[i].trim();
      if(trimmedName.length != ""){
        var newSubFlow = new state.Flow(parts[i]);
        scratch.addSubFlow(newSubFlow);
        scratch = newSubFlow;
      }
    }
  }
  return returnValue;
}

/**
* Call to check if the argument is a valid Flow object.
*/
state.Flow.isFlow = function(objectToTest){
  if(typeof objectToTest                     == "undefined" ||
     typeof objectToTest.name                != "string" ||
     typeof objectToTest.subFlows            == "undefined" ||
     typeof objectToTest.getName             != "function" ||
     typeof objectToTest.setName             != "function" ||
     typeof objectToTest.getFullUpstreamName != "function" ||
     typeof objectToTest.hasSubFlow          != "function" ||
     typeof objectToTest.addSubFlow          != "function"){
    return false;
  }
  return true;
}

module.exports = state;
