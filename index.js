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
  app.State = state.State;

};

/**
* Constructor for a State object.  Initializes everything to empty values.
* currentFlow - this is the current "flow" of the app. May or may not be the
* same as the last prompt.  Which it is depends on the app and the type
* of the flow.
* lastPrompt - this will normally be the identifier of the last thing that was
* asked.  This may be specific or general.  For example, if the app has multiple
* places where it asks for the user's name, this value may store a "generic"
* token for asking for the name, or a specific one for the place in the flow
* where that question was asked.
* gatheredAnswers - these are answers gathered from the user.  The answers are
* typically stored using the token that asked for them.  But it doesn't have to
* be so.  For example, if the app asks for the zip code, the zip code might be
* stored under that token, but the app may also use a separate API to get the
* city/state for the zip code and store those values under different tokens.
* promptCounts - these are the counts of how many times a particular prompt has
* been presented to the user.
*/
state.State = function(){
  this.currentFlow = undefined;
  this.lastPrompt = undefined;
  this.gatheredAnswers = {};
  this.autoIncrementPrompts = false;
  this.promptCounts = {};

  this.clear = function(){
    this.currentFlow = undefined;
    this.lastPrompt = undefined;
    this.gatheredAnswers = {};
    this.autoIncrementPrompts = false;
    this.promptCounts = {};
  }

  this.clear();

  this.setCurrentFlow = function(anotherFlow){
    this.currentFlow = _parseStateToken(anotherFlow);
  }

  this.getCurrentFlow = function(){
    return this.currentFlow;
  }

  this.setLastPrompt = function(prompt){
    this.lastPrompt = _parseStateToken(prompt);
    if(this.autoIncrementPrompts == true){
      this.incrementPromptedCount(this.lastPrompt);
    }
  }

  this.enablePromptCountAutoIncrement = function(){
    this.autoIncrementPrompts = true;
  }

  this.disablePromptCountAutoIncrement = function(){
    this.autoIncrementPrompts = false;
  }

  this.getLastPrompt = function(){
    return this.lastPrompt;
  }

  this.setAnswer = function(token, value){
    var parsedToken = _parseStateToken(token);
    var parts = parsedToken.split(".");
    if(parts.length == 0 || (parts.length == 1 && parts[0] == "")){
      return;
    }
    var nodeToUpdate = this.gatheredAnswers;
    for(var i = 0; i < parts.length; i++){
      if(typeof nodeToUpdate[parts[i]] == "undefined"){
        if(typeof value == "undefined"){
          // Don't bother continuing - we are deleting something that doesn't exist.
          return;
        }
        if(i == parts.length - 1){
          if(typeof value == "undefined"){
            delete nodeToUpdate[parts[i]];
          }
          else {
            nodeToUpdate[parts[i]] = value;
          }
        }
        else {
          nodeToUpdate[parts[i]] = {};
          nodeToUpdate = nodeToUpdate[parts[i]];
        }
      }
      else {
        if(i == parts.length - 1){
          if(typeof value == "undefined"){
            delete nodeToUpdate[parts[i]];
          }
          else {
            nodeToUpdate[parts[i]] = value;
          }
        }
        else {
          nodeToUpdate = nodeToUpdate[parts[i]];
        }
      }
    }
  }
  this.clearAnswer = function(token){
    this.setAnswer(token, undefined);
  }
  this.getAnswer = function(token){
    var parsedToken = _parseStateToken(token);
    var parts = parsedToken.split(".");
    if(parts.length == 0 || (parts.length == 1 && parts[0] == "")){
      return undefined;
    }
    var nodeToFetch = this.gatheredAnswers;
    for(var i = 0; i < parts.length; i++){
      if(typeof nodeToFetch[parts[i]] != "undefined"){
        if(i == parts.length - 1){
          return nodeToFetch[parts[i]];
        }
        else {
          nodeToFetch = nodeToFetch[parts[i]];
        }
      }
      else {
        return undefined;
      }
    }
  }

  this.incrementPromptedCount = function(token){
    var parsedToken = _parseStateToken(token);
    var parts = parsedToken.split(".");
    if(parts.length == 0 || (parts.length == 1 && parts[0] == "")){
      return;
    }
    var nodeToUpdate = this.promptCounts;
    for(var i = 0; i < parts.length; i++){
      if(typeof nodeToUpdate[parts[i]] == "undefined"){
        if(i == parts.length - 1){
          nodeToUpdate[parts[i]] = 1;
        }
        else {
          nodeToUpdate[parts[i]] = {};
          nodeToUpdate = nodeToUpdate[parts[i]];
        }
      }
      else {
        if(i == parts.length - 1){
          nodeToUpdate[parts[i]] = nodeToUpdate[parts[i]] + 1;
        }
        else {
          nodeToUpdate = nodeToUpdate[parts[i]];
        }
      }
    }
  }

  this.resetPromptedCount = function(token){
    var parsedToken = _parseStateToken(token);
    var parts = parsedToken.split(".");
    if(parts.length == 0 || (parts.length == 1 && parts[0] == "")){
      return;
    }
    var nodeToUpdate = this.promptCounts;
    for(var i = 0; i < parts.length; i++){
      if(typeof nodeToUpdate[parts[i]] == "undefined"){
        // Nothing to do - clearing a non-existant count
        return;
      }
      else {
        if(i == parts.length - 1){
          nodeToUpdate[parts[i]] = 0;
        }
        else {
          nodeToUpdate = nodeToUpdate[parts[i]];
        }
      }
    }
  }

  this.getPromptedCount = function(token){
    var parsedToken = _parseStateToken(token);
    var parts = parsedToken.split(".");
    if(parts.length == 0 || (parts.length == 1 && parts[0] == "")){
      return undefined;
    }
    var nodeToFetch = this.promptCounts;
    for(var i = 0; i < parts.length; i++){
      if(typeof nodeToFetch[parts[i]] != "undefined"){
        if(i == parts.length - 1){
          return nodeToFetch[parts[i]];
        }
        else {
          nodeToFetch = nodeToFetch[parts[i]];
        }
      }
      else {
        return 0;
      }
    }
  }
}

var _parseState = function(toParse){
  var jsonObject = JSON.parse(toParse);
  var returnValue = new state.State();
  returnValue.currentFlow = jsonObject.currentFlow;
  returnValue.lastPrompt = jsonObject.lastPrompt;
  returnValue.gatheredAnswers = jsonObject.gatheredAnswers;
  returnValue.autoIncrementPrompts = jsonObject.autoIncrementPrompts;
  returnValue.promptCounts = jsonObject.promptCounts;

  return returnValue;
};

var _stateToString = function(){
  var returnValue = "{";
  returnValue += "\"currentFlow\":" + (typeof this == "undefined" || typeof this.currentFlow != "string"            ? "\"\"," : "\"" + this.currentFlow + "\",");
  returnValue += "\"lastPrompt\":" + (typeof this == "undefined" || typeof this.lastPrompt != "string"              ? "\"\"," : "\"" + this.lastPrompt + "\",");
  returnValue += "\"gatheredAnswers\":" + (typeof this == "undefined" || typeof this.gatheredAnswers == "undefined" ? "{}"    : JSON.stringify(this.gatheredAnswers)) + ",";
  returnValue += "\"autoIncrementPrompts\":" + (typeof this == "undefined" || typeof this.autoIncrementPrompts == "undefined" ? "false" : this.autoIncrementPrompts) + ",";
  returnValue += "\"promptCounts\":" + (typeof this == "undefined" || typeof this.promptCounts == "undefined"       ? "{}"    : JSON.stringify(this.promptCounts));
  returnValue += "}";
  return returnValue;
};

state.State.parseState = _parseState;

state.State.toString = _stateToString.bind(state.State);


state.State.prototype.parseState = _parseState;

state.State.prototype.toString = _stateToString;

var _isChildToken = function(parent, child, parseParent, parseChild){
  if(typeof parseParent == "undefined"){
    parseParent = true;
  }
  if(typeof parseChild == "undefined"){
    parseChild = true;
  }
  if(parseParent){
    var parsedParent = _parseStateToken(parent);
  }
  else {
    var parsedParent = parent;
  }
  if(parseChild){
    var parsedChild = _parseStateToken(child);
  }
  else {
    var parsedChild = child;
  }
  if(parsedParent == parsedChild){
    return true;
  }
  if(parsedChild.startsWith(parsedParent) == false){
    return false;
  }
  var parentLength = parsedParent.length;
  if(parsedChild.substring(parentLength, parentLength + 1) == "."){
    return true;
  }
  return false;
}

state.State.isChildToken = _isChildToken;

state.State.prototype.isChildToken =  _isChildToken;

var _parseStateToken = function(stateToken){
  if(typeof stateToken != "string"){
    return "";
  }
  var parts = stateToken.split(".");
  for(var i = 0; i < parts.length; i++){
    parts[i] = parts[i].trim().toUpperCase().replace(/\s+/g, '_');
  }
  if(parts.length == 0){
    return "";
  }
  if(parts.length == 1){
    return parts[0];
  }
  var parsedToken = parts[0];
  for(var i = 1; i < parts.length; i++){
    parsedToken = parsedToken + '.' + parts[i];
  }

  return parsedToken;
}

module.exports = state;
