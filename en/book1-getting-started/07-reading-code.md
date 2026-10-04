# Reading and Understanding Code

> Verified on 2026-10-04 with Claude Code 2.1.289.

## The problem with inherited code

Picture this: a colleague hands you a project they have built for two years. There are hundreds of files and almost no documentation. Your colleague is unreachable, and you have been asked to add one "simple" feature by Friday.

Even code you wrote yourself can feel like this after six months away. For many people, the most useful thing Claude Code does is not writing new code. It is answering the question *"what is going on here?"*

There is a second reason this chapter matters more than it used to. As agents write more of the code, you will read less of it line by line. What you need instead is a reliable way to build a picture of what a project does, and to check that picture against reality. That skill is asking for explanations, not reading files one at a time.

## Start with an overview

Start Claude Code in the project folder and ask a broad question:

```text
give me an overview of this codebase
```

Claude does not just list files. It looks at folder names, configuration files, package lists and entry points, then summarizes what the project does, how it is organized, which technologies it uses, and how the main parts relate. This is the opening move in the official [Common workflows](https://code.claude.com/docs/en/common-workflows) guide too.

Then narrow down, one question at a time:

```text
explain the main architecture patterns used here
```

```text
what are the key data models?
```

```text
how is authentication handled?
```

Each answer builds on the last. You are taking a guided tour with Claude as the guide.

### Ask for the shape, not the lines

When you are not a programmer, or when the project is large, the most useful requests describe the *form* of the answer you want:

- **A summary:** "Summarize this project in one page for someone who has never seen it. Say what it does, who uses it, and which three files matter most."
- **A glossary:** "List the project-specific terms and what each one means." The official docs suggest this too.
- **A diagram:** "Draw a diagram of how a request flows through the system, as text I can paste into a document." Claude can write diagrams as plain text (for example the Mermaid format, which many tools render as pictures).
- **A visual page:** if you are on a plan that supports artifacts, ask for the explanation as a page rather than as terminal text. For example: "Make an artifact that walks through the checkout flow, with the key files labeled." Artifacts are covered in the [website chapter](/en/book1-getting-started/11-build-website); for this use, a page you can scroll and share is often easier than a long reply.
- **A reading order:** "If I had one hour to understand this project, which five files should I read, in what order, and why?"

You are asking Claude to do the reading and hand you the conclusions. Then you decide where the answer matters enough to look at the real code.

## Ask about specific files and functions

When you already know which file matters, point at it with `@`:

```text
Explain the logic in @src/utils/auth.js
```

The `@` includes the file's full content in the conversation. You can mention several files in one message ("how do @src/auth/login.js and @src/auth/session.js work together?"), and a directory reference such as `@src/components` shows a listing of what is inside rather than every file's contents. Type `@` and a menu of paths appears; press Enter or Tab to accept one.

For a single function, just name it:

```text
Explain what the processPayment function does, step by step
```

```text
Trace what happens from a click on "Submit Order" to the order being saved
```

Tracing a user action through the code is one of the best ways to learn how a system fits together. It also shows you where a bug could hide.

## What does this error mean?

When you run something and get a wall of red text, paste the error and, if you can, the file it names:

```text
I got this error when I ran npm test:

TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/src/components/ProductList.jsx:23:15)

Can you look at @src/components/ProductList.jsx and tell me what's wrong?
```

Claude will usually identify the cause (here, something is `undefined` where a list was expected), point to the line, and suggest a fix. When it can see both the error and the code, its diagnosis is better than when it sees only one. The [Check the Work](/en/book1-getting-started/12-check-the-work) chapter goes deeper on errors.

## Unfamiliar languages, and your own level

Claude reads code in any common language and explains it in plain English. Tell it your level:

```text
I'm primarily a Python developer. Explain this JavaScript in terms I'd understand, comparing to Python where it helps.
```

```text
I'm not a programmer. Explain what this code does in plain language, as if to someone who has never coded.
```

There is no penalty for asking for a simpler explanation. It is better than nodding along to something you did not understand.

## Questions that pay off

- **Start broad, then narrow.** Understand what the system does before you ask how to change it.
- **Ask "why", not only "what".** "Why does this function make three API calls instead of one?" can surface a design decision or a historical reason that reading the code never shows. For history, you can also say: "Look through this file's git history and summarize how it came to be this way."
- **Ask what is missing.** "Which error cases does this module not handle?"
- **Say your goal.** "I need to add bulk upload. Explain how single-file upload works so I can build on it" gets a focused answer instead of a tour of everything.
- **Ask follow-ups freely.** "You said 'middleware'. What does that mean here?" costs nothing, and Claude keeps the context.

## Keep long explorations from filling the session

Everything Claude reads goes into its context window, and the official best-practices guide notes that performance degrades as that window fills. A broad "investigate how auth works" can mean hundreds of file reads. Two habits help:

- Ask Claude to use a subagent for the exploration: "Use a subagent to investigate how our authentication handles token refresh and report back a summary." The subagent reads in its own context and returns only the findings. (Subagents get their own chapter: [Subagents](/en/book2-advanced/05-subagents).)
- Run `/clear` when you switch to an unrelated task.

## When Claude gets it wrong

Claude infers what code does by reading it. It can be wrong, especially with unusual patterns or behavior that depends on things not visible in the files, such as data in a database.

If an explanation does not match what you see when you run the program, trust what you see and say so:

```text
You said this function always returns a list, but when I call it with an empty name I get null. Look again.
```

Treat explanations as claims to test. For anything important, ask Claude to prove it: "Show me the line that does that" or "Write a one-line command that demonstrates it."

### Check that it worked

You have understood a codebase well enough when you can do these three things without opening a file:

1. Explain in two sentences what the project does.
2. Name the file where one specific behavior lives.
3. Predict what will happen for one concrete input, then run the program (or ask Claude to) and see that you were right.

If step 3 surprises you, go back and ask Claude about the surprise. That is where the real learning is.

## Sources

- Anthropic, "Common workflows: Understand new codebases", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/common-workflows
- Anthropic, "Best practices for Claude Code" (context window, subagents for investigation, asking codebase questions), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
- Anthropic, "Share session output as artifacts", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/artifacts
