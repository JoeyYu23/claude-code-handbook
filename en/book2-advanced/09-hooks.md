# Hooks

> Verified on 2026-10-04 with Claude Code 2.1.289.

A hook is your own code that Claude Code runs at a fixed point in a session: before a tool call, after a file edit, when Claude is about to stop, when a session starts. Hooks are the part of your setup that does not depend on the model choosing to cooperate.

That matters more now than it did a year ago. When an agent writes most of the code and you no longer read every line, instructions in `CLAUDE.md` are advice: Claude usually follows them, but nothing forces it to. The official docs say it plainly: for anything that has to happen every time, use a hook. A formatter that always runs, a file that can never be edited, a test suite that must pass before Claude says "done": these are hooks.

This chapter covers how hooks are wired, the events you can hook today, how a hook talks back to Claude Code, four recipes you can copy, and how hooks compare with mods, the in-process extensions that shipped on 2026-10-01.

## Hooks, mods, skills: which is which

Three features overlap, so start by placing them:

| | Settings hook | Mod | Skill |
| :- | :- | :- | :- |
| What it is | A shell command, HTTP request, MCP tool call, prompt or agent that runs on a lifecycle event | TypeScript or JavaScript functions inside a plugin that Claude Code calls in its own process | A `SKILL.md` file of instructions Claude reads |
| Who decides it runs | Claude Code, every time the event fires | Claude Code, every time the event fires | Claude, or you with `/name` |
| Can it block or rewrite an action | Block, allow, rewrite a tool's input or result, add context | Observe, rewrite or take over the event; draw UI | No, it only informs Claude |
| Context cost | Zero unless it returns text for Claude | Depends on what it does | Description every session, body when used |

The docs call the first kind a "settings hook" to tell it apart from a mod's handlers, which are also called hooks. In this chapter "hook" means a settings hook unless it says mod. [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods) covers mods in depth; the [comparison at the end of this chapter](#hooks-or-mods) covers when to pick one over the other.

## How a hook is wired

A hook has three levels: an **event** (when), a **matcher group** (a filter, such as "only the Bash tool"), and one or more **handlers** (what runs). This one blocks `rm` commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```

Two details are newer than most tutorials:

- **`if`** narrows a handler with permission-rule syntax, so the script only spawns for matching calls. It works on tool events only, and it is best effort: when Claude Code cannot tell what a shell command runs, it runs your hook anyway. Use permission rules, not `if`, for a hard allow or deny.
- **`args`** switches a command hook to exec form: the command is spawned directly with no shell, so paths with spaces need no quoting. Leave `args` out when you need pipes or `&&`.

### Matchers

A matcher made only of letters, digits, `_`, `-`, spaces, commas and `|` is an exact match or a list (`Edit|Write`). Anything else is an unanchored JavaScript regular expression, so `Edit.*` also matches `NotebookEdit`; write `^Edit$` when you mean one tool. MCP tools are named `mcp__<server>__<tool>`, and the `.*` is required to match a whole server: `mcp__github__.*`, not `mcp__github`. Matchers are case-sensitive.

What the matcher filters depends on the event: the tool name for tool events, the start reason (`startup`, `resume`, `clear`, `compact`, `fork`) for `SessionStart`, the agent type for subagent events, and so on. Some events ignore matchers entirely, including `UserPromptSubmit` and `Stop`.

### Where hooks live

| Location | Scope |
| :- | :- |
| `~/.claude/settings.json` | All your projects |
| `.claude/settings.json` | This project, committed for the team |
| `.claude/settings.local.json` | This project, just you |
| Managed policy settings | The whole organization |
| A plugin's `hooks/hooks.json` | While the plugin is enabled |
| Skill frontmatter | The rest of the session once the skill runs |
| Subagent frontmatter | While that subagent runs |

Hooks merge across levels rather than replacing each other. Settings-file and plugin hooks also fire inside subagents, with `agent_id` and `agent_type` in the input so you can tell them apart.

## The events

The list has grown well past the first edition's. Grouped by when they fire:

| When | Events |
| :- | :- |
| Session | `Setup` (one-time preparation: `--init-only`, or `--init` / `--maintenance` with `-p`), `SessionStart`, `SessionEnd`, `InstructionsLoaded`, `ConfigChange` |
| Each prompt | `UserPromptSubmit`, `UserPromptExpansion` (a slash command expanding), `MessageDisplay` (display only) |
| Each tool call | `PreToolUse`, `PermissionRequest`, `PermissionDenied` (auto mode refused a call), `PostToolUse`, `PostToolUseFailure`, `PostToolBatch` (a batch of parallel calls finished) |
| End of turn | `Stop`, `StopFailure` (the turn ended on an API error) |
| Agents and tasks | `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `TeammateIdle` |
| Context and model | `PreCompact`, `PostCompact`, `PreModelSwitch`, `PostModelSwitch` |
| Environment | `CwdChanged`, `DirectoryAdded`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `Notification` |
| MCP | `Elicitation`, `ElicitationResult` |

Two practical notes. `Stop` fires every time Claude finishes responding, not only when a task is done, so a heavy Stop hook runs after every answer. And the built-in `/goal` command is a shortcut for a session-scoped, prompt-based Stop hook: if all you want is "keep going until X is true", try `/goal` before writing configuration.

## Five kinds of handler

| `type` | What runs | Default timeout |
| :- | :- | :- |
| `command` | A shell command; event JSON on stdin | 600 s |
| `http` | A POST of the event JSON to a URL | 600 s |
| `mcp_tool` | A tool on one of your configured MCP servers | 600 s |
| `prompt` | One model call that returns `{"ok": true}` or `{"ok": false, "reason": "..."}` | 30 s |
| `agent` | A subagent with Read, Grep and Glob that investigates, then returns the same `ok` shape (experimental) | 60 s |

Defaults are shorter on a few events (30 seconds on `UserPromptSubmit` and the model-switch events), and all `SessionEnd` hooks share a 1.5-second budget unless you raise it. Matching hooks run in parallel.

A `command` hook can also run in the background with `"async": true`. Its output reaches Claude on the next turn, so it cannot block anything. `"asyncRewake": true` is the variant for long checks: it runs in the background and wakes Claude if it exits with code 2.

## Talking back to Claude Code

A command hook communicates through its exit code and stdout.

- **Exit 0** means "no objection". On most events stdout goes to the debug log only; on `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion` and `PostModelSwitch` plain stdout is added as context Claude can read.
- **Exit 2** blocks, on events that can block. Your stderr becomes the reason Claude sees. Nothing in your JSON can override an exit-2 block.
- **Any other exit code** is a non-blocking error: the action goes ahead and the transcript shows a hook-error notice.

::: warning Exit 1 does not block
Exit 1 is the usual Unix failure code, and a policy hook that exits 1 lets the action through. Use `exit 2`. The same trap catches a mistyped script path: the shell exits 127, the action proceeds, and your gate is silently off. Watch for the hook-error notice on the first run.
:::

For finer control, exit 0 and print one JSON object. `PreToolUse` uses `hookSpecificOutput`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes are not allowed"
  }
}
```

`permissionDecision` can be `allow`, `deny`, `ask` or `defer`, and `updatedInput` can rewrite the tool's arguments before it runs. `PostToolUse` can replace a tool's result with `updatedToolOutput`, which is where redaction belongs. `Stop`, `PostToolUse` and several others use a top-level `{"decision": "block", "reason": "..."}`. Any hook can add `systemMessage` (a note for you) or `continue: false` (stop everything). Text a hook hands to Claude is capped at 10,000 characters; longer output is saved to a file and replaced with a preview.

HTTP hooks use the same JSON in a 2xx response body. A non-2xx status is a non-blocking error, so an HTTP hook can only block by returning a decision.

## Recipes

These use `jq` to read the event JSON. Install it first (`brew install jq`, or your package manager).

### Format every file Claude edits

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }
        ]
      }
    ]
  }
}
```

The path field is `tool_input.file_path`. Scripts copied from older guides that read `.tool_input.path` get an empty string and silently do nothing. This hook only sees the Edit and Write tools; to reformat a specific file however it changes, including through `Bash`, use a `FileChanged` hook that watches that filename.

### Make some files untouchable

Save as `.claude/hooks/protect-files.sh` and `chmod +x` it:

```bash
#!/bin/bash
# .claude/hooks/protect-files.sh: refuse edits to secrets and lockfiles
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

for pattern in ".env" "package-lock.json" ".git/"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done
exit 0
```

Register it on `PreToolUse` with matcher `Edit|Write` and the command `"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-files.sh`. When we asked a headless session to bump `lockfileVersion` in a protected `package-lock.json`, the edit never happened and Claude reported that a project hook had blocked it. A path check like this does not stop `sed -i` through Bash; pair it with a `Bash` hook or deny rules if that matters.

### Do not let Claude finish while tests fail

A `Stop` hook that runs the tests and sends Claude back to work when they fail:

```bash
#!/bin/bash
# .claude/hooks/tests-must-pass.sh: don't let Claude finish while tests fail
INPUT=$(cat)

# Already continuing because a Stop hook blocked once? Let Claude stop.
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Nothing changed in the working tree? Nothing to test.
[ -z "$(git status --porcelain)" ] && exit 0

if ! OUTPUT=$(npm test 2>&1); then
  jq -n --arg out "$(echo "$OUTPUT" | tail -20)" \
    '{decision: "block", reason: ("Tests are failing. Fix them before you finish.\n" + $out)}'
fi
exit 0
```

The `git status` check keeps the hook from running the suite after a turn where Claude only answered a question. The `stop_hook_active` check gives Claude one extra attempt; delete it and Claude Code's own cap applies instead, which overrides a Stop hook after eight continuations in a row (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` changes it). Building the reason with `jq` rather than string concatenation keeps quotes in test output from breaking the JSON.

The same gate as an agent hook, if you would rather describe the check than script it:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

Agent hooks are experimental and cost a model run each time. Prefer the command version for anything you rely on.

### Get told when Claude needs you

In `~/.claude/settings.json`, so it applies everywhere:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

On Linux, swap in `notify-send "Claude Code" "Needs your attention"`. Hooks have no terminal of their own, so they cannot write to `/dev/tty`; to ring the bell or set the window title, return a `terminalSequence` field instead.

## Hooks and permissions

A `PreToolUse` hook runs before any permission-mode check, in every mode. A hook that denies a call blocks it even under `bypassPermissions` or `--dangerously-skip-permissions`, which is how you enforce a rule people cannot switch off by changing modes.

It does not work the other way. A hook that returns `allow` cannot override a deny rule, and an ask rule still prompts. Hooks tighten; they do not loosen. A practical pattern from the docs: allow `Bash` broadly, then block the few commands you never want with a `PreToolUse` hook.

The exception is mods. A mod that handles `tool.check` answers after rules and hooks, and can approve a call your `PreToolUse` hook blocked, unless that hook lives in managed settings. On a personal machine without managed settings, it can even approve a call a deny rule refuses. On Team and Enterprise plans, or any machine with managed settings, deny rules hold over mods by default.

## Hooks or mods?

Mods arrived on 2026-10-01 (Claude Code 2.1.287). Anthropic's announcement says why: hooks "can't rewrite events, draw new UI, or replace features. Mods can." A mod is a function inside Claude Code that can run before, after or instead of an event, share state between handlers, add a pane or a `/command`, and call a model.

Pick a settings hook when:

- the job is block, allow, log or format, and a script you already have does it;
- you want it to run the same way in `claude -p`, CI and every surface, with no plugin to install;
- you want a reviewer to understand it in one read.

Pick a mod when you need something hooks cannot do: draw in the interface, add a command that runs your code without a Claude turn, rewrite a prompt, or keep state across events.

Mind the trust difference. Both run with your permissions, but a mod is not sandboxed, can see every prompt and tool call, can approve calls on your behalf, and can spend your usage. Before installing one, `claude plugin validate ./some-mod` lists the events it handles and the calls it makes. Mods run in `claude -p` and the Agent SDK too, but what they draw shows only in the terminal and the Desktop app.

## Security

Command hooks run as you, with full access to your files. Three rules:

1. **Read hooks in repositories you did not write.** In an interactive session, Claude Code holds back settings-file hooks until you accept the workspace trust dialog. A `-p` or SDK session never shows that dialog and runs the hooks in a repo's `.claude/settings.json` straight away. Before scripting `claude -p` over someone else's repo, read its `.claude/` files, or run with `--bare`, or pass `--settings '{"disableAllHooks": true}'`.
2. **Quote variables and check paths.** Use `"$VAR"`, reject `..` in file paths, and reference scripts through `${CLAUDE_PROJECT_DIR}`.
3. **Let admins lock it down.** `allowManagedHooksOnly` in managed settings blocks user, project, local and plugin hooks; `allowedHttpHookUrls` limits where HTTP hooks may post. `disableAllHooks` in user or project settings cannot turn off managed hooks.

[Containment and Security](/en/book3-architect/09-containment-and-security) puts hooks in the wider picture of fences around an agent.

## Debugging

- `/hooks` opens a read-only list of every hook, labelled with where it came from.
- Pipe a sample event into the script and check the exit code:

  ```bash
  echo '{"tool_name":"Edit","tool_input":{"file_path":"/repo/.env"}}' | .claude/hooks/protect-files.sh
  echo "exit=$?"
  ```

- `claude --debug-file /tmp/claude-debug.log` records every hook run and its output. Set `CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose` to see matcher decisions.
- If JSON output seems ignored, make sure stdout holds only the JSON object. A shell profile that prints on startup breaks parsing.

### Check that it worked

1. Run `/hooks` and confirm each hook appears under the right event, with the right source.
2. Pipe a matching and a non-matching event into each script, as above. The protected path should print `Blocked: ...` and `exit=2`; an ordinary path should print `exit=0`.
3. Do it for real once: ask Claude to edit a protected file, or to finish with a failing test. The edit should not happen, or Claude should go back to fix the test, and the transcript should show the hook's reason.
4. If nothing happens, open the debug log and search for the event name.

## Sources

- Hooks reference, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/hooks
- Automate actions with hooks (hooks guide), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/hooks-guide
- Configure permissions: Extend permissions with hooks, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/permissions
- Extend Claude Code (features overview), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/features-overview
- Mods overview, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/plugins/mods/overview
- "Customize Claude Code with mods", Anthropic (claude.com blog), 2026-10-01. https://claude.com/blog/claude-code-mods
- Run Claude Code programmatically (headless), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/headless
