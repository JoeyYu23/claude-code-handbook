# Keyboard Shortcuts

A complete reference for every keyboard shortcut available in Claude Code. Organized by context: terminal/CLI shortcuts, VS Code extension shortcuts, and general text editing.

---

## Before You Start: Platform Notes

Many shortcuts differ between Mac and Windows/Linux. This guide uses:
- **Mac:** `Cmd` for the Command key, `Option` for the Option/Alt key
- **Windows/Linux:** `Ctrl` for the Control key, `Alt` for the Alt key

**macOS users:** Several shortcuts use the `Option` key as Meta. These require a one-time terminal configuration:
- **iTerm2:** Settings → Profiles → Keys → set Left/Right Option key to "Esc+"
- **Terminal.app:** Settings → Profiles → Keyboard → check "Use Option as Meta Key"
- **VS Code integrated terminal:** Settings → Profiles → Keys → set Option key to "Esc+"

Once configured, `Option+B`, `Option+F`, etc. will work as expected.

Press `?` inside a Claude Code session to see shortcuts available in your specific environment.

---

## Terminal / CLI Shortcuts

### Session Control

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Cancel the current operation or input |
| `Ctrl+D` | Exit Claude Code (sends end-of-file signal) |
| `Ctrl+L` | Clear the terminal screen (conversation history is preserved) |
| `Ctrl+R` | Search through command history (type to filter, `Ctrl+R` again to cycle older matches) |
| `Esc` + `Esc` | Rewind or summarize (restore code/conversation to a previous point, or summarize from a message) |

### Navigation and Output

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Toggle verbose output (shows detailed tool usage and execution steps) |
| `Ctrl+G` | Open current prompt (or plan) in your default text editor |
| `Ctrl+T` | Toggle task list visibility in the terminal status area |
| `Up arrow` | Navigate to previous command in history |
| `Down arrow` | Navigate to next command in history |
| `Left / Right arrows` | Cycle through tabs in permission dialogs and menus |

### Permission Mode Switching

| Shortcut | Action |
|---|---|
| `Shift+Tab` | Cycle through permission modes (default → auto-accept → plan mode → default) |

### Background Tasks

| Shortcut | Action |
|---|---|
| `Ctrl+B` | Background the currently running command (tmux users: press twice) |
| `Ctrl+X Ctrl+K` | Kill all background agents (chord sequence: press `Ctrl+X`, then `Ctrl+K`) |

### Model and Thinking

| Shortcut | Action |
|---|---|
| `Cmd+P` (Mac) / `Meta+P` (Win/Linux) | Switch model without clearing your prompt |
| `Cmd+T` (Mac) / `Meta+T` (Win/Linux) | Toggle extended thinking on/off (run `/terminal-setup` first) |

### Paste

| Shortcut | Action |
|---|---|
| `Ctrl+V` | Paste image from clipboard |
| `Cmd+V` (iTerm2) | Paste image from clipboard (iTerm2 only) |
| `Alt+V` (Windows) | Paste image from clipboard |

---

## Text Editing Shortcuts (Within the Prompt)

These shortcuts work while you are typing in the prompt box — before you send your message.

### Line Editing

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Delete from cursor to end of line (deleted text is saved for pasting) |
| `Ctrl+U` | Delete the entire current line (deleted text is saved for pasting) |
| `Ctrl+Y` | Paste the most recently deleted text |
| `Alt+Y` (after Ctrl+Y) | Cycle through paste history (Mac: requires Option as Meta) |

### Word Navigation

| Shortcut | Action |
|---|---|
| `Alt+B` (Mac: requires Option as Meta) | Move cursor back one word |
| `Alt+F` (Mac: requires Option as Meta) | Move cursor forward one word |

### Multiline Input

| Method | How |
|---|---|
| Quick escape (all terminals) | Type `\` then press `Enter` |
| macOS default | `Option+Enter` |
| iTerm2, WezTerm, Ghostty, Kitty | `Shift+Enter` (works out of the box) |
| VS Code, Alacritty, Zed, Warp | `Shift+Enter` (run `/terminal-setup` to enable) |
| Control sequence | `Ctrl+J` (line feed) |

---

## Quick Commands (Prompt Prefixes)

Type these at the start of your prompt to trigger special behavior:

| Prefix | Action |
|---|---|
| `/` | Open command menu — shows all available slash commands |
| `!` | Run a shell command directly without asking Claude (output is added to conversation) |
| `@` | Trigger file path autocomplete — reference a file in your prompt |

---

## Slash Commands (Built-in)

Type `/` in Claude Code to see all available commands. These are the most commonly used:

| Command | What it does |
|---|---|
| `/help` | Show available commands and shortcuts |
| `/clear` | Clear conversation history and start fresh (previous session is saved and resumable) |
| `/compact` | Compress conversation history to free up context space |
| `/memory` | View all loaded CLAUDE.md and auto-memory files; toggle auto-memory |
| `/permissions` | View and manage permission rules (allowlist and denylist) |
| `/resume` | Open a conversation picker to resume a previous session |
| `/rename` | Give the current session a descriptive name |
| `/init` | Generate a CLAUDE.md file for the current project |
| `/config` | Open the settings interface |
| `/theme` | Change the color theme |
| `/vim` | Enable vim-style editing mode |
| `/add-dir` | Add an additional directory for Claude to access in the current session |
| `/agents` | List available subagents and create new ones |
| `/mcp` | Manage MCP server connections |
| `/btw` | Ask a quick side question without adding it to conversation history |
| `/effort` | Set the reasoning effort level: `/effort low`, `/effort medium`, `/effort high` |
| `/model` | Switch to a different Claude model |
| `/fast` | Toggle fast mode (lower latency, less thorough reasoning) |

---

## VS Code Extension Shortcuts

These shortcuts work inside the VS Code Claude Code extension panel.

### Opening Claude

| Shortcut | Action |
|---|---|
| Click spark icon (editor top-right) | Open Claude panel (requires a file to be open) |
| Click spark icon (Activity Bar) | Open sessions list |
| `Cmd+Shift+P` / `Ctrl+Shift+P` → "Claude Code" | Open via Command Palette |
| Click "✱ Claude Code" in Status Bar | Open Claude (always available, even without a file open) |

### Navigation

| Shortcut | Action |
|---|---|
| `Cmd+Esc` / `Ctrl+Esc` | Toggle focus between editor and Claude |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | Open new Claude conversation in editor tab |
| `Cmd+N` / `Ctrl+N` | Start new conversation (when Claude is focused) |

### Working with Files

| Shortcut | Action |
|---|---|
| `Option+K` / `Alt+K` | Insert @-mention reference for current file and selection into prompt |
| `Shift` + drag file into prompt | Add file as attachment |
| `Cmd+click` / `Ctrl+click` on image reference | Open image in default viewer |

### Sending Messages

| Setting | Default | Alternative |
|---|---|---|
| Send message | `Enter` | Enable `useCtrlEnterToSend` setting to use `Ctrl+Enter` instead |
| New line in prompt | `Shift+Enter` | |

### Checkpoints (VS Code Only)

| Action | How |
|---|---|
| Reveal rewind button | Hover over any message |
| Fork conversation from this point | Click rewind → "Fork conversation from here" |
| Revert file changes to this point | Click rewind → "Rewind code to here" |
| Fork and revert | Click rewind → "Fork conversation and rewind code" |

---

## Vim Mode Shortcuts

Enable vim mode with `/vim` or in `/config`. These shortcuts are available in NORMAL mode.

### Mode Switching

| Key | Action |
|---|---|
| `Esc` | Enter NORMAL mode |
| `i` | Insert before cursor |
| `I` | Insert at beginning of line |
| `a` | Insert after cursor |
| `A` | Insert at end of line |
| `o` | Open new line below |
| `O` | Open new line above |

### NORMAL Mode Navigation

| Key | Action |
|---|---|
| `h` / `j` / `k` / `l` | Left / down / up / right |
| `w` | Next word |
| `b` | Previous word |
| `e` | End of word |
| `0` | Beginning of line |
| `$` | End of line |
| `gg` | Beginning of input |
| `G` | End of input |
| `f{char}` | Jump to next occurrence of character |

### NORMAL Mode Editing

| Key | Action |
|---|---|
| `x` | Delete character |
| `dd` | Delete line |
| `cc` | Change line |
| `yy` | Copy (yank) line |
| `p` | Paste after cursor |
| `P` | Paste before cursor |
| `.` | Repeat last change |
| `>>` | Indent line |
| `<<` | Dedent line |

---

## Session Picker Shortcuts

When the session picker is open (from `claude --resume` or `/resume`):

| Key | Action |
|---|---|
| `↑` / `↓` | Navigate between sessions |
| `→` / `←` | Expand or collapse grouped sessions |
| `Enter` | Resume highlighted session |
| `P` | Preview session content |
| `R` | Rename highlighted session |
| `/` | Search/filter sessions |
| `A` | Toggle between current directory and all projects |
| `B` | Filter to sessions from current git branch |
| `Esc` | Exit picker or cancel search |

---

## CLI Flags That Function Like Shortcuts

These command-line flags change Claude Code's behavior when starting a session:

| Flag | Effect |
|---|---|
| `claude -c` | Continue the most recent conversation |
| `claude -r` | Open session picker (or `claude -r name` to resume by name) |
| `claude -n name` | Start session with a custom name |
| `claude --permission-mode plan` | Start in plan mode |
| `claude --permission-mode acceptEdits` | Start in auto-accept mode |
| `claude -v` | Print Claude Code version number |
| `claude update` | Update Claude Code to the latest version |

---

*Press `?` in any Claude Code session to see shortcuts specific to your current terminal and platform configuration.*
