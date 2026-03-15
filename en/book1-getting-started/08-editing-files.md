# Chapter 8: Editing Files

## Claude as a Surgeon, Not a Bulldozer

When Claude Code edits your files, it does not rewrite everything from scratch. It performs targeted, precise changes — finding the exact location in a file where something needs to change and modifying only that part.

Think of it like a surgeon versus a demolition crew. A demolition crew tears everything down and rebuilds. A surgeon makes a precise incision, does the minimum necessary work, and closes everything back up. Claude Code is the surgeon.

Understanding how edits work helps you use this capability confidently and catch the rare cases when something goes unexpectedly.

---

## How Claude Edits Files

Claude Code uses an edit tool that works like a sophisticated find-and-replace. It locates a specific stretch of text in a file, removes it, and replaces it with new text. This happens at the character level — Claude is not regenerating the whole file, it is swapping out a targeted section.

For creating entirely new files, Claude uses a write tool that places a complete new file at the path you specify.

When Claude is about to make an edit, you will see something like this in your terminal:

```
Editing src/utils/validation.js:

- function validateEmail(email) {
-   return email.includes('@');
- }
+ function validateEmail(email) {
+   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+   return regex.test(email);
+ }

Allow this edit? [y/n]
```

Lines starting with `-` (often shown in red) are being removed. Lines starting with `+` (often shown in green) are being added. The context around the change is shown to help you understand where in the file this is happening.

This "diff" format is worth learning to read. Once you can quickly scan it, you can review Claude's proposed changes in seconds rather than minutes.

---

## Reviewing Changes Before Accepting

The review step is your most important protection. Before you press `y`, ask yourself:

1. **Is this the right file?** Check the file path at the top.
2. **Is this the right location in the file?** Look at the context lines around the change.
3. **Is what is being removed correct?** The red lines should be exactly what you expected to remove.
4. **Is what is being added correct?** The green lines should achieve what you asked for.
5. **Does anything look suspicious?** Unexpected changes to unrelated parts of the file are a warning sign.

You do not need to understand every line of code to perform a reasonable review. If the removed lines look like roughly what you described and the added lines look like roughly what you asked for, that is usually sufficient. You can always run the code and test afterward.

---

## Your Response Options

When Claude presents a proposed edit, you have more options than just yes or no:

**`y` (or just pressing Enter)** — Accept the change. Claude makes the edit and moves on.

**`n`** — Decline the change. Claude will not make the edit and will usually ask you what to do differently.

**Type a correction instead** — If Claude's proposed change is almost right but not quite, you can type what you actually want instead of `y` or `n`. For example, if Claude wants to name a variable `userInput` but you want it called `formData`, type that. Claude adjusts and re-proposes.

In auto-accept mode (see Chapter 6), these prompts do not appear — changes land immediately. The same review mindset applies, just in a different form: you are watching changes appear and can stop Claude with `Ctrl+C` if something looks wrong.

---

## Multi-File Edits

Real features often require changing multiple files. A new database field might need changes to the database schema file, a data access layer file, and a UI component — three files touched for one feature.

Claude Code handles this naturally. When you ask for a change that requires multiple files, it will propose and ask permission for each edit in sequence. You review and approve (or decline) each one individually.

This is actually a feature, not a quirk. Getting approval for each file gives you a clear picture of the scope of a change. If Claude wants to edit eight files when you expected three, that is important information — it might be correct, or it might signal that Claude misunderstood the task.

Example conversation:

```
Me: Add a "nickname" field to user profiles

Claude: I'll add the nickname field. I'll need to make changes to 4 files:
1. src/models/User.js — add the field definition
2. src/api/users.js — update the API to accept/return the field
3. src/components/ProfileForm.jsx — add the input field to the form
4. src/components/ProfileView.jsx — display the nickname if present

[Shows each edit in sequence, asking for approval]
```

---

## When Edits Go Wrong — How to Undo

Sometimes you approve an edit and then realize it was not right. What now?

**Option 1: Ask Claude to reverse it**

```
That edit wasn't quite right. Can you undo the change you just made to validation.js?
```

Claude can read the current state of the file and make a new edit that reverts the change, as long as you catch it soon enough in the same conversation.

**Option 2: Use git**

If your project uses git (and it should — see Chapter 10), this is your most reliable safety net. Every time you make meaningful progress, commit. Then if something goes wrong, you can revert:

```bash
git diff          # See what changed
git checkout .    # Discard all uncommitted changes
```

Claude Code will also help you with this:

```
The last few edits made things worse. Can you help me revert to a clean state?
```

**Option 3: Undo in your editor**

If you are working in VS Code, most text editors support multi-level undo (`Cmd+Z` on Mac, `Ctrl+Z` on Windows/Linux). If the file is open, you can undo Claude's recent changes the same way you would undo your own typing.

The bottom line: **commit early and often**. Git is the ultimate undo button, and Claude Code works brilliantly with git (more on this in Chapter 10).

---

## Best Practices for Requesting Edits

### Be specific about what you want changed

Vague: "Fix the validation."
Better: "The email validation accepts addresses like 'test@' with no domain. Fix it to require a complete domain."

The more specific you are about the problem, the more precisely Claude can target the fix.

### Describe the goal, not the implementation

You do not need to know how to fix something to ask Claude to fix it. Describe what you want the end result to look like:

"I want the button to be disabled while the form is submitting, and re-enabled when the submission completes."

Claude figures out the implementation. Your job is communicating the desired behavior.

### One logical change at a time

It is tempting to bundle everything together: "Fix the validation, add the nickname field, and change the date format." But asking for multiple unrelated changes at once makes it harder to review each change and harder to understand what went wrong if something breaks.

Separate distinct changes into separate requests. Claude is fast — it does not slow you down to break things up.

### Ask for a plan first on large changes

For changes that might touch many files or involve complex logic, ask for a plan before any edits begin:

```
Before making any changes, can you tell me which files you would need to modify and what you would do to each one? I want to review the approach before we start.
```

This is essentially asking Claude to do a mental walkthrough before picking up any tools. It gives you a chance to catch misunderstandings early, before code has changed.

### Review with your tests

If your project has automated tests, ask Claude to run them after making edits:

```
After making these changes, please run the tests and let me know if anything broke
```

Tests are the automated reviewer that catches the things both you and Claude might miss during manual review.

---

## A Note on File Creation

Creating a new file feels different from editing an existing one, but the process is the same. Claude will show you the full content of the file it plans to create and ask your permission before writing it to disk.

When Claude creates a new file, pay particular attention to:
- The file name and location (is it where you expected?)
- Whether the file follows the project's existing naming conventions
- Whether it imports or references things correctly

A new file that cannot be found by the rest of the project is useless. Claude generally gets this right, but it is worth confirming.

---

**Next up:** [Chapter 9 — Running Commands](./09-running-commands.md) — How Claude executes shell commands, what it can do with them, and how to stay in control.
