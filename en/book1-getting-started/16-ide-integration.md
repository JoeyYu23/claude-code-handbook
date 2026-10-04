# IDE Integration

> Verified on 2026-10-04 with Claude Code 2.1.289.

You can use Claude Code in your terminal, or inside a code editor (an IDE, short for integrated development environment). They share the same engine, so your CLAUDE.md files, settings, and MCP servers work the same everywhere. This chapter helps you pick, and shows how to set up the editors Claude Code supports.

## VS Code (and Cursor)

The official extension gives Claude a graphical panel inside VS Code. Anthropic recommends it as the way to use Claude Code in VS Code.

**Requirements:** VS Code 1.94.0 or later, and an Anthropic account. Any paid Claude subscription (Pro, Max, Team, Enterprise) or a Claude Console account works; no API key is needed. You sign in the first time you open the extension.

### Install

In VS Code press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux), search for "Claude Code", and click **Install**. In Cursor, which is built on VS Code, install the same extension from its extension panel.

### Open Claude

- Click the spark icon at the top right of an open file. (The icon needs a file to be open.)
- Click **Claude Code** in the Status Bar at the bottom right. This works even with no file open.
- Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`), type "Claude Code", and pick an option such as "Open in New Tab".

### What the extension adds

- **Reviewing edits in the editor.** Proposed changes appear as a diff you can accept or reject before anything is written.
- **Selection context.** Claude sees the text you have highlighted. Press `Option+K` (Mac) or `Alt+K` (Windows/Linux) to insert an @-mention such as `@file.ts#5-10` into your prompt.
- **@-mentions** for files and folders.
- **Plan review.** In plan mode, VS Code opens the plan as a Markdown document where you can comment before Claude starts.
- **Past conversations and multiple tabs.** Resume earlier sessions, or run several conversations side by side.
- **Checkpoints.** Hover over a message and use the rewind button to fork the conversation, rewind the code, or both.
- **A permission-mode picker** at the bottom of the prompt box. Auto uses a classifier to review actions instead of asking you; Manual asks before file edits and most shell commands; Plan describes the work and waits for approval. See [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions).

Keyboard shortcuts for the extension are listed in [Keyboard Shortcuts](/en/book1-getting-started/keyboard-shortcuts).

### What the extension does not have

The extension supports a subset of the commands, and does not have the `!` shell shortcut or tab completion. If you need those, open VS Code's integrated terminal (`` Ctrl+` `` on Windows/Linux, `` Cmd+` `` on Mac) and run `claude`. The CLI there connects to your editor automatically for diff viewing and error sharing. From a terminal outside the editor, type `/ide` to connect.

### Check that it worked

Open a project folder, open the Claude panel, and ask: "What files are in this project?" Claude should answer from your folder. Then select a few lines in a file and look at the prompt box footer: it should show how many lines are selected.

## JetBrains (IntelliJ IDEA, PyCharm, WebStorm, GoLand and others)

The JetBrains plugin runs the `claude` command inside your IDE's terminal, so you install two things: the CLI (see [Installation](/en/book1-getting-started/04-installation)) and the plugin.

1. Install the **Claude Code** plugin from the JetBrains Marketplace and restart the IDE. (The marketplace listing is labeled Beta.)
2. Run `claude` in the IDE's integrated terminal. All features are then active. From an external terminal, run `claude` and then `/ide`; you should see a message like `Connected to IntelliJ IDEA.`
3. Press `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux) to open Claude Code from the editor.

What you get: edits shown in the IDE's own diff viewer, your current selection shared automatically, file references inserted with `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Linux/Windows), and IDE error and warning messages visible to Claude.

If `claude` is not found, set its full path in **Settings, Tools, Claude Code [Beta]**. If Esc does not interrupt Claude, uncheck "Move focus to the editor with Escape" in **Settings, Tools, Terminal**.

## Terminal only

The terminal is the most complete interface: every command works, you can pipe text in (`cat errors.log | claude -p "explain this"`), and it suits scripts and automation. Its cost is that you review changes as text rather than a side-by-side view.

## Which should you choose?

| If you... | Try... |
| --- | --- |
| Are new to editors and code | VS Code with the extension: the diff view makes edits easy to review |
| Already live in Cursor | The same extension in Cursor |
| Use IntelliJ, PyCharm or WebStorm | The JetBrains plugin |
| Want every command, or run Claude in scripts | The terminal (it also works inside any editor's built-in terminal) |

If unsure, start with the VS Code extension and drop to the terminal for the odd task.

## Safety note for JetBrains

The JetBrains documentation warns that in `acceptEdits` mode Claude may be able to change IDE configuration files that the IDE can execute automatically. It suggests using Manual mode for edits, and only running Claude with prompts you trust.

## Sources

- Anthropic, "Use Claude Code in VS Code", Claude Code documentation, accessed 2026-10-04. https://code.claude.com/docs/en/vs-code
- Anthropic, "JetBrains IDEs", Claude Code documentation, accessed 2026-10-04. https://code.claude.com/docs/en/jetbrains

Next: [Glossary](/en/book1-getting-started/glossary)
