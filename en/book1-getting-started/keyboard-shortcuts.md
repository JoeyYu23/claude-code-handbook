# Keyboard Shortcuts

> Verified on 2026-10-04 with Claude Code 2.1.289.

Every shortcut below was checked against Anthropic's documentation. Shortcuts can vary by platform and terminal. Press `?` on an empty prompt to see the list for your own setup.

**Mac note.** Shortcuts that use `Alt` (`Alt+B`, `Alt+F`, `Alt+D`, `Alt+Y`, `Alt+P`) need your terminal set to treat Option as Meta. The setting is under your terminal's keyboard preferences; Anthropic's page "Terminal configuration" lists it for each terminal.

## Everyday controls

| Shortcut | What it does |
| --- | --- |
| `Ctrl+C` | Interrupts a running operation. With nothing running, the first press clears the prompt and a second press exits |
| `Esc` | Stops Claude mid-response so you can redirect; Claude keeps the work done so far. Also closes a dialog |
| `Esc` `Esc` | With text in the prompt: clears it (and saves the draft so `Up` brings it back). With an empty prompt: opens the rewind menu to restore code and conversation to an earlier point |
| `Ctrl+D` | Exits Claude Code (press twice). If the prompt has text, deletes the character after the cursor |
| `Shift+Tab` | Cycles permission modes |
| `Option+P` (Mac) / `Alt+P` | Switches model without clearing your prompt |
| `Option+T` (Mac) / `Alt+T` | Turns extended thinking on or off. No effect on models that always think |
| `Option+O` (Mac) / `Alt+O` | Turns fast mode on or off |
| `Ctrl+O` | Opens or closes the transcript viewer: detailed tool use, and lines that are collapsed by default |
| `Ctrl+T` | Shows or hides Claude's task checklist |
| `Ctrl+B` | Moves running Bash commands and agents to the background (tmux users press it twice) |
| `Ctrl+X` `Ctrl+K` | Stops all background subagents in this session. Press twice within 3 seconds to confirm |
| `Ctrl+G` or `Ctrl+X` `Ctrl+E` | Opens your prompt in your default text editor |
| `Ctrl+L` | Redraws the screen if it looks garbled. Conversation is kept |
| `Ctrl+R` | Searches previous commands |
| `Ctrl+S` | Stashes the prompt text; press again on an empty prompt to restore it |
| `Ctrl+Z` | Suspends Claude Code (Unix only); type `fg` to resume |
| `Ctrl+V` (`Cmd+V` in iTerm2, `Alt+V` on Windows and WSL) | Pastes an image from the clipboard |
| `Up` / `Down` | Move the cursor in a multi-line prompt, then step through history |
| `Tab` | Accepts an autocomplete suggestion |

Changes from earlier guidance: the model and thinking toggles use `Option` on Mac, not `Cmd`. `Ctrl+O` now opens the transcript viewer rather than a "verbose" switch.

## Permission modes

`Shift+Tab` cycles through `default` (shown as Manual), `acceptEdits`, `plan`, and, when available, `bypassPermissions` and then `auto`. From `auto`, the first press goes back to `default`. See [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions). On Windows when VT input mode is not enabled, `Alt+M` does the same.

## Editing text in the prompt

| Shortcut | What it does |
| --- | --- |
| `Ctrl+A` / `Ctrl+E` | Start / end of the current line |
| `Alt+B` / `Alt+F` | Back / forward one word |
| `Ctrl+K` | Delete to the end of the line (saved for pasting) |
| `Ctrl+U` | Delete to the start of the line (saved for pasting) |
| `Ctrl+W` | Delete back to the previous whitespace, so one press removes a whole file path |
| `Alt+D` | Delete to the end of the word |
| `Ctrl+Y` | Paste the text you last deleted; `Alt+Y` afterward cycles through earlier deletions |
| `Ctrl+_` or `Ctrl+Shift+-` | Undo the last edit to the prompt |

## New lines in a prompt

| Method | Works in |
| --- | --- |
| `\` then `Enter` | All terminals |
| `Ctrl+J` | Any terminal, no setup |
| `Shift+Enter` | iTerm2, WezTerm, Ghostty, Kitty, Warp, Apple Terminal, Windows Terminal. Other terminals: see Anthropic's "Terminal configuration" page |
| `Option+Enter` | macOS, after setting Option as Meta |
| Paste | Pasting multi-line text works directly |

## Prefixes: the first character of a prompt

| Type | Result |
| --- | --- |
| `/` | Commands and skills. Filter by typing letters |
| `!` | Shell mode: runs a command directly, adds the output to the session, and Claude responds to it |
| `@` | File path autocomplete |
| `:` | Emoji shortcodes such as `:tada:` |
| `?` on an empty prompt | Shows the shortcut help panel |

## Transcript viewer (`Ctrl+O`)

| Key | What it does |
| --- | --- |
| `q`, `Ctrl+C` or `Esc` | Leave the viewer |
| `{` / `}` | Jump to the previous or next prompt (fullscreen rendering) |
| `[` | Write the full conversation to terminal scrollback so your terminal's search works (fullscreen rendering) |
| `v` | Open the conversation in your `$VISUAL` or `$EDITOR` (fullscreen rendering) |

## Picking up an earlier session

Open the session picker with `claude --resume`, or `/resume` inside a session.

| Key | What it does |
| --- | --- |
| `Up` / `Down` | Move between sessions |
| `Left` / `Right` | Collapse or expand grouped sessions |
| `Enter` | Resume the highlighted session |
| `Space` | Preview the session |
| `Ctrl+R` | Rename the highlighted session |
| `/` or any letter | Search (you can also paste a pull request URL) |
| `Ctrl+A` | Show sessions from all projects; press again to go back |
| `Ctrl+B` | Show only sessions from the current git branch |
| `Esc` | Close the picker |

(The first edition listed single-letter keys `P`, `R`, `A` and `B` for these; the current picker uses the keys above.)

## Vim mode

Turn it on in `/config` under Editor mode. The old `/vim` command was removed in Claude Code 2.1.92. In NORMAL mode, the common keys are:

| Keys | What they do |
| --- | --- |
| `Esc` | Enter NORMAL mode |
| `i` `I` `a` `A` `o` `O` | Insert before cursor / at line start / after cursor / at line end / new line below / new line above |
| `h` `j` `k` `l` | Left, down, up, right |
| `w` `e` `b` | Next word, end of word, previous word |
| `0` `$` `^` | Line start, line end, first non-blank character |
| `gg` `G` | Start, end of input |
| `x` `dd` `D` | Delete character, line, to end of line |
| `cc` `C` `cw` | Change line, to end of line, word |
| `yy` `p` `P` | Copy line, paste after, paste before |
| `u` `.` | Undo, repeat last change |
| `>>` `<<` | Indent, dedent line |
| `v` `V` | Start character-wise or line-wise selection |

The documentation lists more motions, text objects and visual-mode commands; this table is the common core. You can map `jj` (or another two-key sequence) to Escape with the `vimInsertModeRemaps` setting in your user settings.

## VS Code extension

| Shortcut | What it does |
| --- | --- |
| `Cmd+Esc` / `Ctrl+Esc` | Toggle focus between editor and Claude |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | Open a new conversation in an editor tab |
| `Cmd+N` / `Ctrl+N` | New conversation. Works only when Claude is focused and the `enableNewConversationShortcut` setting is on |
| `Cmd+Shift+T` / `Ctrl+Shift+T` | Reopen the most recently closed Claude tab |
| `Option+K` / `Alt+K` | Insert an @-mention of the current file and selection (editor must be focused) |
| `Ctrl+Option+F` / `Ctrl+Alt+F` | Toggle Focus view, which hides tool calls and thinking |
| `Enter` | Sends the prompt. Turn on the `useCtrlEnterToSend` setting to require `Ctrl/Cmd+Enter` |

On macOS Tahoe and later, `Cmd+Esc` may be taken by the system; see [Troubleshooting](/en/book1-getting-started/troubleshooting).

## JetBrains

`Cmd+Esc` / `Ctrl+Esc` opens Claude Code from the editor. `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Linux/Windows) inserts a file reference such as `@src/auth.ts#L1-99`.

## Handy command-line flags

| Command | Effect |
| --- | --- |
| `claude -c` | Continue the most recent conversation |
| `claude -r` | Open the session picker; `claude --resume <name>` resumes a named session |
| `claude -n <name>` | Start a session with a display name |
| `claude --permission-mode plan` | Start in plan mode (other choices include `acceptEdits`, `auto`, `manual`) |
| `claude update` | Update Claude Code |
| `claude -v` | Print the version |

### Check that it worked

Start `claude`, type `?` on the empty prompt: the help panel opens with the shortcuts for your terminal. Then type a few words and press `Ctrl+U`: the line clears, and `Ctrl+Y` brings it back.

## Sources

- Anthropic, "Interactive mode" (keyboard shortcuts, vim mode), Claude Code documentation, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- Anthropic, "Work with sessions" (session picker), accessed 2026-10-04. https://code.claude.com/docs/en/sessions
- Anthropic, "Use Claude Code in VS Code" and "JetBrains IDEs", accessed 2026-10-04. https://code.claude.com/docs/en/vs-code
- Anthropic, Claude Code commands reference (`/vim` removed), accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Local CLI: `claude --help`, version 2.1.289.
