# Chapter 7: Reading and Understanding Code

## The Problem With Inherited Code

Picture this: your colleague hands you a project they have been building for two years. The folder has hundreds of files. There is almost no documentation. Your colleague is now unreachable. And your manager has asked you to add one "simple" feature by end of week.

This scenario plays out constantly in software development. Even when you write the code yourself, coming back to a project after six months can feel like reading someone else's work.

Claude Code's ability to read and explain code is, for many users, its single most immediately useful feature. Not writing new code. Not running commands. Just this: *tell me what is going on here.*

This chapter shows you how to use that capability to its fullest.

---

## The Killer Starting Point: "Give Me an Overview"

When you first drop Claude Code into an unfamiliar project, the best opening move is a broad question:

```
Give me an overview of this codebase
```

What you will get back is not just a file listing. Claude reads through the project structure — looking at file names, folder organization, configuration files, package lists, entry points, and key source files — and synthesizes a summary of:

- What the project does
- How it is organized
- What technologies it uses
- What the main components are and how they relate

This single question, asked in an empty session over a large codebase, can give you more situational awareness than an hour of poking around yourself.

From there, you narrow down:

```
Explain the main architecture patterns used here
```

```
What are the key data models in this project?
```

```
How does the authentication system work?
```

Each follow-up builds on the previous one. You are doing a guided tour of the codebase, with Claude as your guide.

---

## Asking About Specific Files

Sometimes you know which file you care about. You can be direct:

```
Explain what src/api/handlers.js does
```

Or use the `@` reference syntax to pull a file directly into the conversation:

```
Walk me through the logic in @src/utils/validation.js
```

The `@` prefix tells Claude to read that specific file and focus the conversation on it. You can mention multiple files at once:

```
How do @src/auth/login.js and @src/auth/session.js work together?
```

This is useful when you know a bug or feature involves multiple files and you want to understand their relationship before changing anything.

---

## Asking About Specific Functions

Large files can be overwhelming. If you want to drill down to a specific piece of logic:

```
Explain what the processPayment function does, step by step
```

```
What does the useFormValidation hook return, and when should I use it?
```

```
Walk me through what happens when the exportToPDF function is called
```

Claude will read the function, trace its inputs and outputs, explain any side effects, and tell you what edge cases it handles (or fails to handle). This is significantly faster than reading the code yourself if you are unfamiliar with the language or the patterns being used.

---

## "What Does This Error Mean?"

This is one of the most common reasons people turn to Claude Code. You run something, you get a wall of red text, and you have no idea where to start.

The simplest approach:

```
I got this error when I ran npm test:

TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/src/components/ProductList.jsx:23:15)
    at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:16141:18)
    ...
```

Claude will:
1. Identify the root cause (something is `undefined` when the code expects an array)
2. Point you to the exact file and line number (`ProductList.jsx` line 23)
3. Explain why this probably happened
4. Suggest a fix

You can also paste the error and ask Claude to look at the relevant file:

```
I'm getting this error: [error text]. Can you look at @src/components/ProductList.jsx and tell me what's wrong?
```

When Claude can see both the error and the code, its diagnosis is much more accurate than if it only sees one or the other.

---

## Understanding Unfamiliar Languages

One of Claude Code's underrated superpowers: it reads code in any programming language, and it will explain that code in plain English regardless of what language you know.

If you are a Python developer looking at a JavaScript project:

```
I'm primarily a Python developer. Can you explain this JavaScript code in terms I would understand, drawing comparisons to Python where helpful?
```

If you are entirely new to programming and looking at any code:

```
I'm not a programmer. Can you explain what this code does in plain language, as if explaining it to someone who has never coded before?
```

Claude will adjust its explanation to your stated level. Do not be embarrassed to ask for simpler explanations — it is always better to ask than to pretend you understood something you did not.

---

## Exploring Large Codebases

Some projects have thousands of files. You cannot read everything. Claude Code gives you a smarter way to navigate.

**Find where something lives:**

```
Where in this codebase is the email notification logic handled?
```

```
Which files would I need to modify to change how user profiles are displayed?
```

**Trace the flow of a feature:**

```
Trace what happens from when a user clicks "Submit Order" all the way to when the order is stored in the database
```

This kind of flow tracing — from a user action through the code to a final outcome — can reveal a lot about how a system works, which dependencies exist, and where a bug might hide.

**Understand naming conventions and patterns:**

```
What naming conventions does this project follow?
```

```
What design patterns are used in this codebase? Are there any inconsistencies?
```

Understanding a project's patterns helps you write code that fits in rather than code that sticks out.

---

## Tips for Better Code Reading Sessions

### Start broad, then narrow

Resist the urge to jump immediately to "how do I fix X?" Start with "what does this system do?" Understanding context makes specific questions much easier to answer correctly.

### Ask "why" not just "what"

```
Why is the data being stored in localStorage instead of a database here?
```

```
Why does this function make three API calls instead of one?
```

"Why" questions often reveal architectural decisions, historical context, or technical constraints that pure code reading will not tell you.

### Ask about what's missing

```
What functionality would you expect to see in a module like this that seems to be missing?
```

```
Are there any obvious error cases that this code doesn't handle?
```

Claude can identify gaps in your code — places where things could go wrong but there is no handling — just as easily as it can explain what is there.

### Tell Claude your goal

Context helps Claude give better answers:

```
I need to add a bulk upload feature. Before I start, can you help me understand how the existing single-file upload works so I can build on it?
```

Knowing your goal helps Claude focus its explanation on what matters for your specific task rather than explaining everything equally.

### Ask follow-up questions freely

You do not have to understand everything on the first pass. If Claude's explanation contains a term you do not recognize, ask:

```
You mentioned "middleware" — can you explain what that means in this context?
```

```
I didn't understand the part about race conditions. Can you explain that more simply?
```

Claude remembers the context of your conversation. You can always ask for clarification without losing your place.

---

## When Claude Gets It Wrong

Claude Code is reading your code and making inferences. Sometimes it will be wrong — especially if the code is unusual, uses surprising patterns, or depends on context that is not visible in the files.

If Claude's explanation does not match what you observe when you actually run the code, trust what you observe. Tell Claude what is different:

```
You said this function always returns an array, but when I call it, I sometimes get null. Can you look again?
```

Claude will re-examine its reasoning and usually correct itself. Treating it as a dialogue — where you can push back — makes for much better outcomes than accepting every explanation uncritically.

---

## What Reading Code Teaches You

Here is a secret that experienced developers know: the best way to learn a programming language or a framework is to read a lot of code written in it. Traditionally, that was slow and frustrating because you had to parse everything yourself.

With Claude Code, you can read code much faster. You see a pattern, ask what it means, understand it in thirty seconds, and move on. Over time, those patterns accumulate. Your own mental model of how code works grows rapidly.

Using Claude Code to understand code is not cheating. It is accelerated learning.

---

**Next up:** [Chapter 8 — Editing Files](./08-editing-files.md) — How Claude makes changes to your code, and how to review and control those changes.
