# Your First Conversation

> Verified on 2026-10-04 with Claude Code 2.1.289.

Time to use it. By the end of this chapter you will have started a session, asked a question, watched Claude Code create a real file, and checked the result yourself.

## Step 1: Make a practice folder

Claude Code treats the folder you start it in as your project. It reads and creates files there. Make a fresh one to experiment in:

```bash
mkdir my-first-claude-project
cd my-first-claude-project
```

## Step 2: Start Claude Code

```bash
claude
```

Because this folder is new, Claude Code may first ask whether you trust it. It is your own empty folder, so yes. You then see a prompt with the version, the model and the folder shown above it. Below the prompt, the status bar shows the permission mode, most likely `⏵⏵ auto mode on`. Chapter 6 explains what that means; for now, know that Claude will act without asking about routine steps.

## Step 3: Ask a question

Type this and press Enter:

```
What files are in this folder?
```

Claude looks and tells you the folder is empty. Trivial, but notice that it checked rather than guessed.

## Step 4: Ask it to make something

```
Create a simple HTML page that says Hello World, with a little styling.
```

Claude writes an `index.html` file and tells you it did. In auto mode it does not stop to ask first: creating or editing a file inside your project folder is routine and can be undone, so auto mode approves it without even consulting its safety classifier.

If your status bar says `manual mode on` instead, you will see a permission prompt first. It shows what Claude wants to do and offers options such as **Yes**, **Yes, and don't ask again** (for commands), **Yes, and switch to auto mode**, and **No**. Use the arrow keys and Enter, or press `Esc` to decline. Press `Tab` to amend the request with a comment, like "call it home.html instead".

## Step 5: Check it yourself

Do not take Claude's word for it. Open the file:

```bash
open index.html        # Mac
start index.html       # Windows
xdg-open index.html    # Linux
```

Run that in a second terminal window, or ask Claude to run it for you. You should see "Hello World" in your browser. This habit, looking at the actual result, is the most important one in this book. Chapter 12 builds on it.

## Step 6: Keep the conversation going

Claude remembers everything within a session, so you do not need to repeat context:

```
Now add a button that changes the background color when clicked.
```

You did not say which file. Claude knows. Reload the page in your browser and click the button.

Not every message needs to change something. Questions are fine:

```
Explain what the CSS in index.html does, line by line.
```

This is one of the best ways to learn: build something small, then ask why it works.

## Step 7: Undo something

Ask for a change you do not like, such as "make the background bright red". Then press `Esc` twice on an empty prompt to open the rewind menu, pick the point before that change, and restore it. Or simply type "undo that". Reload the browser to confirm the red is gone.

## Tips for good requests

**Say what "done" looks like.** "Fix the bug" is weak. "Clicking Save does nothing on mobile but works on desktop; fix it and tell me how you checked" is strong.

**Describe the outcome, not the steps.** "Add a short delay before the popup appears" beats instructions about which function to call. Claude can work out the how.

**Give corrections in plain words.** "Close, but put the button on the right" is faster than fixing it yourself.

**Use natural language.** "make that heading bigger" works as well as formal phrasing.

## Common first-timer mistakes

**Believing the summary without looking.** Claude's report of what it did is a claim. Open the file, run the program, click the button.

**Leaving out context.** "It doesn't work" gives Claude nothing. Say what you expected, what happened, and paste any error message.

**Expecting it to know what is only in your head.** It knows your files and this conversation. It does not know your business rules or yesterday's session unless you tell it or write them into `CLAUDE.md` (Chapter 14).

**Forgetting that new sessions start fresh.** After `/clear`, or in a new session, the conversation history is gone. Resume an earlier conversation with `claude --continue` or `/resume`.

## Commands to know

| You type | What it does |
|---|---|
| `/help` | Lists available commands |
| `?` (on an empty prompt) | Shows keyboard shortcuts |
| `Esc` | Stops Claude mid-task so you can redirect it |
| `Esc` `Esc` (empty prompt) | Opens the rewind menu |
| `/clear` | Starts a new conversation with empty context |
| `/resume` | Picks up a previous conversation |
| `Ctrl+C` | Interrupts; when idle, clears the input, and a second press exits |
| `/exit` or `Ctrl+D` twice | Leaves Claude Code |

### Check that it worked

You are done when all of these are true:

1. `ls` (Mac/Linux) or `dir` (Windows) in your practice folder shows `index.html`.
2. Opening it in a browser shows "Hello World" and a button that changes the background color.
3. After Step 7, the bright red background is gone.

Next, [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) explains what Claude was and was not allowed to do while you watched.

## Sources

- "Quickstart", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/quickstart
- "Interactive mode" (keyboard shortcuts), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- "Configure permissions" (permission prompt options), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permissions
- "Choose a permission mode" (status bar labels), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- "Checkpointing", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/checkpointing
