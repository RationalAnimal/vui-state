# vui-state

npm module that provides VUI (voice user interface) session state functions for
inclusion into other vui-xxx projects.

# Repository
This module as well as related vui modules can be found here:
https://github.com/RationalAnimal

# Installation

```shell
	npm install vui-state --save
```

# Summary

This module provides an npm module to be used by other vui-xxx modules to
construct and access session state objects usable within a VUI app.
For typical VUI applications the following things need to be kept track of:

1. What is the last thing that the user was prompted for
2. What is the (entirety of) information gathered from the user
3. Optional - What is the current flow. This may not always be needed because the last thing that the user was prompted for may already identify the flow.
4. Optional - was the question already asked for?  Often we don't care about it - we can check whether we have the answer or not.  But, this could/would typically be used for re-phrasing the prompt.

Note that these values are IN ADDITION to the normal session values, which are covered in the vui-session module, such as user identification, session id, security tokens, etc.

# APIs

## Add the functionality to the "app" object or where ever you want to have it (possibly session). Note - you can still use it directly from the module as well.

````javascript
var state = require("vui-state");
var app = {};
state.addStateToApp(app);
````

## Constructor

new State() - produces a new state object

````javascript
var state = require("vui-state");
var app = {};
state.addStateToApp(app);
var someState = new app.State();
````


## Last prompt

State.setLastPrompt(prompt) - will set the last prompt to properly formatted prompt.

State.getLastPrompt() - will return the last prompt token

````javascript
someState.setLastPrompt(" Intro. first name");
console.log(getLastPrompt());
````
will produce
````shell
INTRO.FIRST_NAME
````

## Gathered information from the user

someState.setAnswer(token, value) - will set the value of the answer for a given question (identified by a token string)
someState.getAnswer(token) - gets the previously stored answer (or undefined if none)
someState.clearAnswer(token) - deletes the answer for a given question

````javascript
someState.setAnswer("INTRO.FIRST_NAME", "John");
console.log(someState.getAnswer("INTRO.FIRST_NAME"));
console.log(someState.gatheredAnswers.INTRO.FIRST_NAME);
````
will produce

````shell
John
John
````

## Current flow

someState.setCurrentFlow(newFlow) - will set the current flow to properly formatted newFlow.
someState.getCurrentFlow() - will return the current flow token

````javascript
someState.setCurrentFlow(" Intro. first name");
console.log(getCurrentFlow());
````
will produce
````shell
INTRO.FIRST_NAME
````

## Counts of prompts

someState.incrementPromptedCount(token) - increment the count of times a particular prompt was spoken
someState.resetPromptedCount(token) - reset to 0 the count of times a particular prompt was spoken
someState.getPromptedCount(token) - get the count of times a particular prompt was spoken
someState.enablePromptCountAutoIncrement() - enable autoincrementing the prompt count whenever setLastPrompt is called
someState.disablePromptCountAutoIncrement() - disable autoincrementing the prompt count whenever setLastPrompt is called


````javascript
someState.incrementPromptedCount("TEST.Flow.prompt1");
someState.incrementPromptedCount("TEST.Flow.prompt1");
someState.incrementPromptedCount("TEST.Flow.prompt2");
someState.resetPromptedCount("TEST.Flow.prompt2");
console.log(someState.getPromptedCount("TEST.Flow.prompt1"));
console.log(someState.getPromptedCount("TEST.Flow.prompt2"));
someState.enablePromptCountAutoIncrement();
someState.setLastPrompt(" Intro. first name");
console.log(someState.getPromptedCount("INTRO.FIRST_NAME"));
console.log(someState.promptCounts.INTRO.FIRST_NAME);
````

will produce

````shell
2
0
1
1
````

## Passing state values around as strings - use parseState and toString

### Parsing JSON into a state objects

````javascript
var toParse = "{\"currentFlow\":\"SAMPLE.FLOW\",\"lastPrompt\":\"SAMPLE.FLOW.PROMPT\",\"gatheredAnswers\":{\"SAMPLE\":{\"FLOW\":{\"PROMPT\":\"simple string value\",\"ANOTHER_PROMPT\":42,\"THIRD_PROMPT\":\"UNIVERSAL_ANSWER\"}}},\"promptCounts\":{}}";
var scratch = app.State.parseState(toParse);
console.log(JSON.stringify(scratch, null, 2));
````

will produce

````shell
{
  "currentFlow": "SAMPLE.FLOW",
  "lastPrompt": "SAMPLE.FLOW.PROMPT",
  "gatheredAnswers": {
    "SAMPLE": {
      "FLOW": {
        "PROMPT": "simple string value",
        "ANOTHER_PROMPT": 42,
        "THIRD_PROMPT": "UNIVERSAL_ANSWER"
      }
    }
  },
  "promptCounts": {}
}
````

### Converting state objects to string

````javascript
var toParse = "{\"currentFlow\":\"SAMPLE.FLOW\",\"lastPrompt\":\"SAMPLE.FLOW.PROMPT\",\"gatheredAnswers\":{\"SAMPLE\":{\"FLOW\":{\"PROMPT\":\"simple string value\",\"ANOTHER_PROMPT\":42,\"THIRD_PROMPT\":\"UNIVERSAL_ANSWER\"}}},\"promptCounts\":{}}";
var scratch = app.State.parseState(toParse);
console.log(scratch.toString());
````

will produce

````shell
{"currentFlow":"SAMPLE.FLOW","lastPrompt":"SAMPLE.FLOW.PROMPT","gatheredAnswers":{"SAMPLE":{"FLOW":{"PROMPT":"simple string value","ANOTHER_PROMPT":42,"THIRD_PROMPT":"UNIVERSAL_ANSWER"}}},"promptCounts":{}}
````
