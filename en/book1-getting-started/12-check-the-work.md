# Check the Work

> Verified on 2026-10-04 with Claude Code 2.1.289.

## The one idea in this chapter

Claude stops when the work *looks* done. That is Anthropic's own description in its best-practices guide: without a check it can run, "looks done" is the only signal available, and you become the verification loop. Every mistake waits for you to notice it.

Claude is good, and mistakes are rarer than they were. But the larger the task, the more places a plausible-looking result can be wrong: a button that does nothing, a number that is off, a feature that works for the example you tried and breaks for the next input. The same guide lists "the trust-then-verify gap" as a common failure and gives the fix in one line: "If you can't verify it, don't ship it."

You do not need to be a programmer to do this well. You need a habit: **before you accept a result, make something prove it.** This chapter gives you four ways, from most to least reliable, and then a short section on what to do when the proof fails.

## 1. Tests first

A *test* is a small program that checks one behavior and says pass or fail. If your project has tests, they are the cheapest and most trustworthy proof available, because they give a clear yes or no that Claude itself can read and act on.

Ask for the check as part of the task:

```text
Write a function validateEmail. Examples: user@example.com is valid, "invalid" is not, user@.com is not. Write tests for these, implement the function, run the tests, and fix any failures.
```

Compare that with "write an email validator". The first version gives Claude a target and a way to know when it has hit it. Claude writes the code, runs the tests, reads the result and iterates until they pass.

Three habits make tests useful:

- **Say what "correct" means in examples.** Real inputs and expected outputs are the best specification a non-programmer can give.
- **Ask for the failing test first when fixing a bug.** "Write a test that reproduces this bug and show me it fails. Then fix it and show me it passes." A test that never failed proves nothing.
- **Read the test names, not the test code.** Ask Claude to list what the tests check in plain English. If a case you care about is missing ("what about an empty name?"), ask for it.

If your project has no tests yet, ask Claude to add some for the behavior you care about most, starting small.

## 2. Ask the agent to prove it works

Tests cover logic. Many things you care about are behaviors: does the page load, does the button work, does the program print the right thing? For these, ask Claude to *run it* and show you the evidence.

```text
Run the app and show me the actual output for this input. Don't tell me it works. Show me the command you ran and what it printed.
```

The best-practices guide recommends exactly this: have Claude show evidence (test output, the command and its result, or a screenshot) because reviewing evidence is faster than redoing the verification yourself. Some useful variants:

- "What did you *not* check?" Claude will often name the untested edge.
- "Try to break it. Give it five inputs that a careless user might type."
- "Walk through the feature as a new user would and report anything confusing."

Claude Code also ships a bundled skill, `/verify`, which builds and runs your app to confirm that a change does what it should, without falling back on tests or type checks alone. It infers how to launch the project from its README, `package.json` or `Makefile`, and when it has to work that out it writes what worked into `.claude/skills/verify/SKILL.md` so later runs follow the same steps. Run it after Claude says it is finished.

## 3. Screenshots

For anything visual, text claims are weak. Show, don't tell, in both directions.

**You to Claude.** Paste a screenshot of the problem or the design you want. In the terminal, copy the image and paste with `Ctrl+V` (`Cmd+V` in iTerm2, `Alt+V` on Windows and WSL), drag a file into the window, or give a file path. Then:

```text
[paste screenshot] Implement this design. Take a screenshot of the result, compare it to the original, list the differences and fix them.
```

**Claude to you.** In the Claude desktop app's Code tab, Claude can start your app in the built-in Browser pane and, by default, verifies its own changes after each edit by taking screenshots, checking for errors and clicking through the page. In the terminal, a browser tool such as the Claude in Chrome extension (started with `claude --chrome`) can give Claude the same ability. Whichever you use, ask for the screenshot in the reply and look at it yourself.

A screenshot Claude took is evidence, but it is Claude's evidence. Open the page yourself at least once.

## 4. A second opinion

An agent grading its own work has the same blind spots that produced the mistake. Claude Code lets you start a fresh reviewer.

```text
/code-review
```

This reviews your branch's commits plus any uncommitted changes for correctness bugs, running as a background subagent with its own context, so it does not clutter your conversation and is not biased by how the code was written. When the findings arrive, tell Claude which to fix. Add `--fix` to have it apply them.

One caution from the docs: a reviewer asked to find gaps will usually report some even when the work is sound. Tell Claude to act only on findings that affect correctness or what you asked for. Chasing every nit leads to over-engineering.

Much more can be built on this idea: automatic gates, graders, separate checking agents. That is the subject of [Verification and Evals](/en/book3-architect/02-verification-and-evals). For now, the manual habit is enough.

## Debugging: when the check fails

A failed check is not a failure of you. Bugs are normal for every developer. What changes with Claude is how fast you can get from "it's broken" to "here is why".

### Paste the actual error

Not "it doesn't work", but the exact text copied from the terminal or browser console. Error messages are dense with information: what went wrong, in which file, on which line.

```text
I ran my server and got:

TypeError: Cannot read properties of null (reading 'email')
    at getUserEmail (/app/src/users.js:47:18)
    at router.get (/app/src/routes/auth.js:23:24)

Find the cause and fix it. Then run the server and show me it works.
```

The list of file names after the message is called a *stack trace*: the chain of calls that led to the crash. If it is unfamiliar, ask: "Walk me through this stack trace step by step." The line nearest the top that points into your own code is usually where to look first.

### When there is no error, only wrong behavior

Describe what you expected and what happened, with a concrete case:

```text
Input: ["Charlie", "Alice", "Bob"]
Expected: ["Alice", "Bob", "Charlie"]
Actual: ["Bob", "Alice", "Charlie"]
Here's the function: @src/sort.js
```

Precision is the whole game. "Login doesn't work" is weak. "I enter a valid email and password, click Login, and nothing happens: no message, no redirect" is strong. Add anything that changed recently ("this worked until I added caching") and what you have already ruled out.

### Make the problem visible

If the cause is not obvious, ask Claude to add temporary logging: "Add log statements to the login function so I can see the values passing through, then run it and read the output." Real values beat guesses.

### Reproduce, then fix, then prove

The method that works for experts also works for you:

1. **Reproduce** the problem reliably (a failing test is ideal).
2. **Form a hypothesis**: ask Claude what it thinks the cause is and why.
3. **Test the hypothesis** before changing things.
4. **Fix** the cause, not the symptom. The guide's example: "address the root cause, don't suppress the error."
5. **Prove** it with the same check that failed before.

Do not accept random changes ("maybe if I make this number bigger"). Ask for the reason behind every fix. If you do not understand the explanation, ask again; understanding the fix is nearly as important as applying it.

### When Claude is stuck

- **Tell it what happened with its suggestion**, including the new error text.
- **Ask it to step back**: "You have tried three fixes. What are we assuming that might be wrong?"
- **Rewind**: if the edits made things worse, `/rewind` (or `Esc` twice with an empty prompt) restores the code and conversation to before the bad turn. Rewind does not undo changes made by shell commands.
- **Start clean after two failed corrections.** The docs advise this: when you have corrected the same issue more than twice, the context is full of failed attempts. Run `/clear` and write a better first prompt that includes what you learned.
- **Use browser developer tools** (F12 in most browsers) for web pages: the Console tab shows errors; screenshot it and paste it in.

### Check that it worked

For any change, you are done when you can say yes to all of these:

1. There is a check (a test, a command, or a screenshot) that failed or did not exist before.
2. You saw that check pass, with the real output in front of you, not a summary.
3. You tried one input that Claude did not suggest.
4. `git diff` or `/diff` shows only the files you expected to change.

## Sources

- Anthropic, "Best practices for Claude Code: Give Claude a way to verify its work; Avoid common failure patterns; Course-correct early and often", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
- Anthropic, "Code Review: Review a diff locally", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/code-review
- Anthropic, "Skills: Run and verify your app" (`/verify`), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/skills
- Anthropic, "Checkpointing", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/checkpointing
- Anthropic, "Common workflows: Fix bugs efficiently; Work with images", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/common-workflows
- Anthropic, "Claude Code Desktop: Preview your app", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/desktop
