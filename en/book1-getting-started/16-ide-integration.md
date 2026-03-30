# Chapter 16: IDE Integration

## Two Paths to Claude Code

There are two main ways to use Claude Code: in your terminal (the command-line interface, or CLI), and inside a code editor (an IDE, or Integrated Development Environment).

Neither is strictly better. They have different strengths, and many developers use both depending on what they are doing. This chapter covers the major IDE integrations so you can decide which setup — or combination — works best for you.

---

## VS Code Extension

Visual Studio Code is the world's most popular code editor, used by tens of millions of developers. The official Claude Code extension brings Claude directly into the VS Code interface.

### Installing the Extension

Open VS Code and press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux) to open the Extensions panel. Search for "Claude Code" and install the extension published by Anthropic.

Alternatively, click this type of link in your browser: `vscode:extension/anthropic.claude-code` — VS Code will open and prompt you to install it directly.

The extension requires VS Code version 1.98.0 or higher. Check your version at Help → About.

### Opening Claude in VS Code

Once installed, you have several ways to open the Claude panel:

- Click the spark icon (the Claude logo) in the top-right corner of any open file
- Click the spark icon in the left Activity Bar to see your conversation history
- Press `Cmd+Shift+P` / `Ctrl+Shift+P` to open the Command Palette, type "Claude Code", and select an option
- Click "✱ Claude Code" in the bottom-right Status Bar — this works even when no file is open

### What the VS Code Extension Adds

Beyond what the terminal CLI does, the extension provides:

**Inline diff view:** When Claude wants to edit a file, it shows a side-by-side view of the original and the proposed change — like a code review. You can accept, reject, or ask for modifications before anything changes.

**@-mentions:** In your message, type `@` followed by a file name to reference specific files. Fuzzy matching means you can type a partial name: `@auth` might match `auth.js`, `AuthService.ts`, and `auth.test.ts`. Claude will offer completions.

**Selection context:** When you highlight code in your editor, Claude automatically sees it. The prompt box shows how many lines are selected. Press `Option+K` (Mac) / `Alt+K` (Windows/Linux) to insert an @-mention with the file path and line numbers into your prompt.

**Conversation history:** A dropdown at the top of the panel shows all your past conversations, searchable and resumable. Sessions are given AI-generated descriptive titles so you can find them at a glance.

**Multiple conversations:** Open additional Claude conversations in separate tabs or windows for working on different tasks simultaneously.

**Checkpoints:** Hover over any message to reveal a rewind button. You can fork the conversation from a previous point, revert file changes to an earlier state, or do both simultaneously. This is more sophisticated version control for your Claude sessions.

**Plan mode integration:** When Claude creates a plan (in plan mode — see Chapter 6), VS Code opens it as a full Markdown document where you can add inline comments before Claude proceeds.

**Built-in MCP server:** VS Code 1.98.0+ includes a built-in MCP (Model Context Protocol) server that exposes two tools to the model: `getDiagnostics` (TypeScript/JavaScript diagnostics) and `executeCode` (run selected code). Other editor interactions like file access and selection reading are handled by internal RPC between the CLI and VS Code — these are not MCP tools visible to Claude. The MCP server connects automatically when you use the extension; no additional configuration is needed.

### Keyboard Shortcuts in VS Code

| Shortcut | What it does |
|---|---|
| `Cmd+Esc` / `Ctrl+Esc` | Toggle focus between editor and Claude |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | Open new conversation in editor tab |
| `Cmd+N` / `Ctrl+N` | Start new conversation (when Claude is focused) |
| `Option+K` / `Alt+K` | Insert @-mention for current file/selection |

### Permission Modes in VS Code

The prompt box in VS Code has a mode indicator at the bottom. Click it to cycle through:
- **Default mode** — Claude asks before each action
- **Plan mode** — Claude describes what it will do, you approve before it starts
- **Auto-accept** — Claude makes edits without asking each time

You can set a default mode in VS Code settings under Extensions → Claude Code → `initialPermissionMode`.

---

## Cursor Integration

Cursor is a code editor built specifically for AI-assisted development — it is a fork of VS Code with AI features deeply embedded throughout. If you are already a Cursor user, Claude Code integrates there too.

### Installing in Cursor

The installation process is the same as VS Code. In Cursor's extension panel, search for "Claude Code" and install it. Or use the direct link: `cursor:extension/anthropic.claude-code`.

### Using Claude Code in Cursor

The experience in Cursor is nearly identical to VS Code — the same panel, the same @-mention syntax, the same keyboard shortcuts. Since Cursor and VS Code share the same extension architecture, the Claude Code extension works the same way in both.

One note: Cursor has its own AI assistant built in. Claude Code and Cursor's built-in AI can coexist — they serve different purposes and use different interfaces. Claude Code's strength is its ability to run commands, use git, read entire codebases, and take agentic action. Cursor's built-in assistant handles quick inline completions. Many developers use both.

---

## JetBrains Plugin

JetBrains makes a family of powerful editors: IntelliJ IDEA for Java/Kotlin, PyCharm for Python, WebStorm for JavaScript/TypeScript, GoLand for Go, and others. The Claude Code plugin works across all of them.

### Installing the Plugin

Open any JetBrains IDE and go to Settings (or Preferences on Mac) → Plugins → Marketplace. Search for "Claude Code Beta" and install it. After installation, restart the IDE.

Alternatively, visit the JetBrains Marketplace website, find the Claude Code plugin, and install it from there.

### What the JetBrains Plugin Provides

The JetBrains plugin provides:

**Interactive diff viewing:** When Claude proposes file changes, they appear as diffs within the JetBrains diff viewer — the same viewer you use for regular git diffs. If you are comfortable with JetBrains' diff UI, Claude Code edits will feel natural.

**Selection context sharing:** Like the VS Code extension, the JetBrains plugin passes your selected code to Claude automatically.

**Conversation history:** All past conversations are accessible and resumable.

**Remote Development and WSL support:** The JetBrains plugin works in JetBrains Gateway and WSL (Windows Subsystem for Linux) environments, so you can run Claude Code on a remote server or in a Linux environment while working locally in your IDE.

The JetBrains plugin is labeled "Beta" — it is fully functional but may have occasional rough edges. If you encounter issues, file them on the GitHub repository.

---

## Terminal-Only Workflow

The original and still most powerful way to use Claude Code is the terminal CLI. Nothing about the IDE integrations surpasses it — they add visual convenience, but the CLI has capabilities the extensions do not.

### Why Developers Choose Terminal-Only

**Full command access.** The CLI has every Claude Code command available. The IDE extensions support a subset — the most common things — but some advanced features are only accessible in the terminal.

**Shell integration.** In the terminal, you can pipe data into Claude (`cat errors.log | claude -p "explain this"`), chain commands, and use Claude as part of shell scripts.

**`!` bash shortcut.** Type `!` at the start of your input to run a shell command directly and have its output added to the conversation. This is only available in the terminal.

**Tab completion.** The CLI has tab completion for file paths and command history.

### Running the CLI from Inside VS Code or JetBrains

You do not have to choose. If you want the graphical interface of VS Code but also need occasional CLI access, use VS Code's integrated terminal:

- In VS Code: press `` Ctrl+` `` (or `` Cmd+` `` on Mac) to open the integrated terminal
- Run `claude` to start a CLI session inside VS Code
- Type `/ide` inside the CLI session to connect it to the VS Code editor (for features like diff viewing)

This gives you both interfaces simultaneously. The CLI and the extension share the same conversation history, so you can seamlessly move between them.

---

## Choosing the Right Setup

Here is a simple framework for deciding:

| If you... | Consider... |
|---|---|
| Are new to code editors | VS Code extension — it has the best onboarding experience and the widest user base for finding help |
| Already use Cursor | The Cursor extension — identical experience to VS Code |
| Already use IntelliJ, PyCharm, or WebStorm | The JetBrains plugin — stay in your existing environment |
| Prefer a minimal setup with maximum control | Terminal-only — the CLI is the most powerful interface |
| Want the best of both worlds | VS Code + terminal inside it — run the extension for visual diff review and the CLI for everything else |
| Are running automated tasks or CI | Terminal-only — the CLI is designed for scripting and automation |

### One Setup to Try First

If you are unsure, start with the VS Code extension. The inline diff view alone is worth it — being able to see exactly what Claude is changing in a familiar split-pane view makes it much easier to review edits confidently. You can always fall back to the terminal for specific tasks.

---

## The Shared Foundation

One important thing to know: all these interfaces connect to the same underlying Claude Code engine. Your `CLAUDE.md` files, settings, memory, and MCP server configurations work the same way whether you are using the terminal, VS Code, Cursor, or JetBrains.

Start a conversation in the terminal, continue it in VS Code, finish it on the web — it is all the same Claude Code. Choose the interface that fits your moment, not your identity.

---

**Next up:** The [Glossary](./glossary.md) — Definitions for every term used in this book and throughout the Claude Code ecosystem.

---

You have completed Book 1. If this handbook has been useful, consider [starring the repo on GitHub](https://github.com/JoeyYu23/claude-code-handbook) — it helps others find it.

Ready for more? [Start Book 2: Advanced Patterns →](/en/book2-advanced/)
