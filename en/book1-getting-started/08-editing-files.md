# Editing Files

> Verified on 2026-10-04 with Claude Code 2.1.289.

## A surgeon, not a bulldozer

When Claude Code edits a file, it does not rewrite everything. It finds the exact spot that needs to change and swaps out only that part, much like find-and-replace. To make a brand-new file it writes the whole file at the path it chooses.

Knowing this helps you review changes quickly and notice the rare case when something unexpected happens.

## Reading a diff

Depending on your permission mode (next chapter: [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions)), Claude either asks before an edit or makes it and shows you what changed. Either way you will see a *diff*: lines starting with `-` (usually red) are removed, lines starting with `+` (usually green) are added, and the surrounding lines show where in the file it happens.

```text
- function validateEmail(email) {
-   return email.includes('@');
- }
+ function validateEmail(email) {
+   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+   return regex.test(email);
+ }
```

The exact wording and keys of the approval prompt change between versions and surfaces (terminal, desktop app, editor extension), so this book does not reproduce them. What stays the same is what you are asked to judge.

You do not need to understand every character. Ask five questions:

1. Is this the right file?
2. Is it the right place in the file?
3. Is what was removed what you expected?
4. Does what was added roughly match what you asked for?
5. Did anything *unrelated* change? That is the warning sign.

If you want a second pair of eyes on a diff, ask: "Explain this change in plain language and tell me what could go wrong."

### Review everything at once with `/diff`

Instead of approving edit by edit, you can let Claude work and then look at the whole result. Run `/diff` to see the changes in your working tree, including anything uncommitted. In fullscreen rendering, in a git repository, with a terminal at least 110 columns wide and version 2.1.287 or later, `/diff` opens a live panel next to the conversation that refreshes as Claude edits. In other cases it opens a dialog above the prompt. In the panel, an `ask` button next to a file attaches that file's diff to your next question, so you can ask "why did you change this?"

## Your options when you disagree

You can accept, decline, or redirect. Declining stops that edit, and Claude will usually ask what to do instead. If it is nearly right, tell it what you want ("call it `formData`, not `userInput`") and it adjusts. Pressing `Esc` interrupts Claude mid-action; the work done so far is kept, and you can redirect.

## Multi-file edits

Real features touch several files. Adding a "nickname" field to user profiles may mean the data model, the API and two screens. Claude plans across those files. The number of files is useful information: if you expected three and Claude touches eight, either it found something you did not know about or it misunderstood. Ask: "Why does this need eight files?"

## Undoing a change

There are three layers, from quickest to most durable.

**1. Ask Claude.** "Undo the last change to validation.js." This works if you catch it soon in the same conversation.

**2. Rewind.** Claude Code snapshots your files before each prompt you send. Run `/rewind`, or press `Esc` twice with an empty prompt, to open the rewind menu. You can restore the code, the conversation, or both, to any earlier prompt. There is one important limit: rewind only tracks edits made through Claude's file-editing tools. Files changed by shell commands (such as `rm` or `mv`) and edits made by most subagents are not restored. Anthropic describes checkpoints as quick session-level recovery, not a replacement for version control.

**3. Git.** The durable safety net. Commit when something works, and you can always return to that point:

```bash
git status      # what changed
git diff        # exactly what changed
git restore .   # discard ALL uncommitted changes to tracked files
```

Be careful with that last command: it throws away uncommitted work and cannot be undone. When in doubt, ask Claude to show you what would be lost first. The [git chapter](/en/book1-getting-started/10-git-workflows) explains the habit.

## Asking for edits well

- **Be specific about the problem.** Not "fix the validation", but "the email check accepts `test@` with no domain; require a complete domain."
- **Describe the result, not the method.** "The button should be disabled while the form is submitting, then re-enabled." Claude chooses how.
- **One logical change at a time.** Bundled requests are harder to review and harder to undo.
- **Plan first for big changes.** Press `Shift+Tab` until the status bar shows plan mode (or start with `claude --permission-mode plan`). Claude reads and proposes a plan without editing anything. The official guidance: if you could describe the diff in one sentence, skip the plan.
- **Ask for a check.** "After the change, run the tests and tell me if anything broke." Tests are the reviewer that never gets tired. The [Check the Work](/en/book1-getting-started/12-check-the-work) chapter is about this.

## Creating new files

Creating a file is the same process as editing one. Glance at the file name and location (is it where you expected?), whether it follows the project's naming habits, and whether the rest of the project will actually find it.

### Check that it worked

After any edit, confirm with your own eyes:

1. Run `/diff` (or `git diff`) and confirm only the files you expected changed.
2. Run the program or its tests, or ask Claude to, and read the result.
3. If something is off, run `/rewind` and pick the prompt before the change.

## Sources

- Anthropic, "Checkpointing", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/checkpointing
- Anthropic, "Interactive mode: Review changes with /diff", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- Anthropic, "Best practices for Claude Code" (plan mode, course-correcting), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
- Anthropic, "What's new" Week 36 (`/diff` live panel), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
