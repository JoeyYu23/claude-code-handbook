# Chapter 8: Hook System Deep Dive

Hooks are shell commands, HTTP requests, or AI prompts that run automatically at specific points in Claude Code's lifecycle. They let you enforce policies, automate quality checks, send notifications, and customize behavior — without interrupting your workflow.

This chapter covers all hook types, event types, configuration format, and practical examples you can use immediately.

---

## What Hooks Are and Are Not

Hooks are **reactive automation triggers**. They fire when Claude takes specific actions, not when you type commands. This makes them fundamentally different from skills (which you or Claude invoke) or agents (which Claude spawns for tasks).

Use hooks when you want something to happen:
- **Every time** Claude edits a specific file type
- **Before** Claude runs a potentially dangerous command
- **After** Claude finishes a task
- **When** a sub-agent starts or stops

Hooks cannot initiate actions on their own — they always respond to Claude's actions.

---

## Hook Types

Claude Code supports four hook implementation types.

### Command Hooks

The most common type. Runs a shell command when the hook fires. The command receives the event data as JSON via stdin and communicates decisions through exit codes and stdout.

```json
{
  "type": "command",
  "command": ".claude/hooks/validate-bash.sh",
  "timeout": 30,
  "async": false
}
```

Set `"async": true` to run the hook in the background without blocking Claude. Async hooks cannot influence decisions (their return values are ignored) but are useful for notifications, logging, and formatting.

**Exit code behavior:**
- `0` — Success. JSON in stdout is parsed for decisions.
- `2` — Blocking error. The stderr message is shown to Claude; the action is prevented.
- Any other code — Non-blocking error. Execution continues.

### HTTP Hooks

Sends the event JSON as a POST request to a URL. The endpoint responds with a JSON decision in the same format as command hooks.

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool-use",
  "timeout": 30,
  "headers": {
    "Authorization": "Bearer $MY_TOKEN"
  },
  "allowedEnvVars": ["MY_TOKEN"]
}
```

HTTP hooks are useful for integrating with existing infrastructure — Slack webhooks, audit logging services, policy enforcement APIs.

### Prompt Hooks

Asks Claude Haiku a yes/no question about whether to proceed. The LLM evaluates the situation and returns an `ok: true/false` decision.

```json
{
  "type": "prompt",
  "prompt": "Should Claude stop working? Check if all tasks are complete. $ARGUMENTS",
  "model": "claude-haiku",
  "timeout": 30
}
```

Response format:
```json
{
  "ok": true,
  "reason": "All tests passing, documentation updated, ready to ship"
}
```

Prompt hooks are useful when the decision requires reasoning that is hard to capture in a simple script.

### Agent Hooks

Spawns a sub-agent with full tool access (Read, Grep, Glob) to verify a condition before returning a decision. More powerful than prompt hooks — the agent can actually read files, run tests, and check real state.

```json
{
  "type": "agent",
  "prompt": "Verify that all unit tests pass before this commit is created. Run the test suite. $ARGUMENTS",
  "timeout": 120
}
```

Agent hooks are the most powerful option but also the most expensive (they consume additional tokens and time).

---

## Hook Events

### PreToolUse

Fires before any tool executes. Can block the tool call entirely.

Common uses: validate bash commands, block file writes to restricted paths, require confirmation for destructive operations.

Input includes the tool name and all tool parameters. Example input for a Bash tool call:

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/build",
    "description": "Clean build directory"
  },
  "session_id": "abc123",
  "cwd": "/Users/devuser/projects/myapp"
}
```

To block a PreToolUse hook (exit code 2), the hook's stderr is shown to Claude as context for why the action was blocked.

### PostToolUse

Fires after a tool executes successfully. Can trigger follow-up actions.

Common uses: auto-format after file edits, run linting after writes, log tool usage for auditing.

Input includes everything from PreToolUse plus the tool output:

```json
{
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": { "path": "src/auth.py", ... },
  "tool_output": { "success": true }
}
```

### PostToolUseFailure

Fires when a tool call fails. Unlike `PostToolUse`, this fires on error. Useful for logging failures, alerting on unexpected errors, or triggering fallback actions.

### Stop

Fires when Claude stops responding (the agentic loop ends). Can force Claude to continue by returning `{"decision": "block", "reason": "Tests must pass before stopping"}`.

Common uses: enforce quality gates (tests must pass, no TODOs), require documentation updates, post-completion cleanup.

### StopFailure

Fires when the Stop hook itself fails or returns an error. Useful for monitoring hook health in critical automation pipelines.

### Notification

Fires when Claude sends an alert — such as a permission prompt or an idle prompt. Cannot block but is useful for logging and monitoring.

### SubagentStart / SubagentStop

Fires when a sub-agent begins or completes. The matcher can target specific agent types.

Common uses: set up database connections before a DB agent starts, clean up after analysis agents finish.

### TeammateIdle

Fires when a teammate (in Agent Teams experimental mode) finishes its current task and is waiting for more work. Useful for coordinating work distribution across teammates.

### TaskCompleted

Fires when a delegated task completes, regardless of whether it succeeded or failed. Provides a hook point for task-level logging and monitoring independent of the tool-level events.

### SessionStart / SessionEnd

Fires at the beginning and end of a session. Useful for loading environment-specific context or triggering cleanup.

### InstructionsLoaded

Fires after `CLAUDE.md` files and other instruction sources are loaded at session start. Can be used to inject additional dynamic context after the static instructions are in place.

### UserPromptSubmit

Fires when you submit a prompt. Can add context to your message before Claude sees it or block prompts that match unwanted patterns.

### PermissionRequest

Fires when Claude shows a permission dialog. Can auto-approve known-safe operations or auto-deny known-dangerous ones.

### ConfigChange

Fires when a settings file changes. Useful for auditing configuration changes in team environments.

### WorktreeCreate / WorktreeRemove

Fires when a git worktree is created or removed. Can be used to set up or tear down worktree-specific configuration and resources.

### PreCompact / PostCompact

Fires before and after a `/compact` operation. `PreCompact` can add information to preserve in the summary. `PostCompact` can inject fresh context into the new conversation.

### CwdChanged

Fires when the current working directory changes during a session (for example, when `/add-dir` is used). Can be used to load directory-specific context or update environment variables.

### FileChanged

Fires when a file on disk changes outside of Claude's direct edits (for example, a build system output or an external tool writing to the project). Can be used to notify Claude of external changes.

### Elicitation / ElicitationResult

`Elicitation` fires when an MCP server requests structured input from the user. Can auto-provide credentials, configuration values, or other inputs without user intervention. `ElicitationResult` fires after the elicitation is resolved, with the value that was provided.

---

## Configuration Structure

Hooks are configured in settings files with this structure:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/format-and-lint.sh"
          }
        ]
      }
    ]
  }
}
```

The three-level nesting is:
1. **Event type** (`PreToolUse`, `PostToolUse`, etc.)
2. **Matcher** — a regex pattern matching the tool name or event subtype
3. **Handler(s)** — the actual hook implementation

### Where Hooks Are Configured

| File | Scope | Version-controlled |
|---|---|---|
| `~/.claude/settings.json` | All your projects | No |
| `.claude/settings.json` | This project, all team members | Yes |
| `.claude/settings.local.json` | This project, you only | No |
| Skill or agent frontmatter | During that skill/agent's lifetime | With the skill/agent |

Project-level hooks (`.claude/settings.json`) should be committed to version control so your whole team benefits.

**A note on `settings.local.json`:** The `.claude/settings.local.json` file is for project-local settings that should not be committed to version control. It uses the same format as `settings.json` but is intended for personal preferences — such as `bypassPermissions` overrides, machine-specific paths, or experimental hook configurations you do not want to push to the team. When both files exist, keys in `settings.local.json` take precedence over `settings.json`. Add `.claude/settings.local.json` to your `.gitignore` to prevent accidental commits of personal or sensitive configuration.

---

## Matcher Patterns

Matchers use regex syntax against tool names or event subtypes:

```json
"matcher": "Bash"           // Exact match
"matcher": "Edit|Write"     // Bash OR Write
"matcher": "mcp__.*"        // All MCP tools
"matcher": "mcp__github__.*" // All GitHub MCP tools
"matcher": ".*"             // All tools (no matcher needed for this)
```

For `SubagentStart` and `SubagentStop`, the matcher applies to the agent type name:

```json
"matcher": "db-agent"         // Only the db-agent subagent
"matcher": "Explore|Plan"     // Built-in Explore or Plan agents
```

---

## Practical Examples

### Example 1: Auto-format Python on Edit

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/format-python.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/format-python.sh

FILE=$(echo "$(cat)" | jq -r '.tool_input.path // empty')

if [[ "$FILE" == *.py ]]; then
  black "$FILE" 2>/dev/null
  isort "$FILE" 2>/dev/null
fi

exit 0
```

Every time Claude edits a Python file, black and isort run automatically. You never get a PR with formatting issues again.

### Example 2: Block Dangerous Bash Commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/validate-bash.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block destructive operations
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+/|drop\s+database|truncate\s+table'; then
  echo "Blocked: Potentially destructive command requires manual confirmation" >&2
  exit 2
fi

# Block operations outside the project directory
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
if echo "$COMMAND" | grep -qE 'cd\s+/(?!tmp)'; then
  echo "Blocked: Directory change outside /tmp requires review" >&2
  exit 2
fi

exit 0
```

This hook blocks the most dangerous bash patterns and forces you to approve them manually.

### Example 3: Run Tests After Edit

```bash
#!/bin/bash
# .claude/hooks/run-affected-tests.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.path // empty')

# Only run if a source file was edited, not a test file itself
if [[ "$FILE" == src/* ]] && [[ "$FILE" != *.test.* ]]; then
  # Run tests for the edited module
  MODULE=$(basename "$FILE" | sed 's/\.[^.]*$//')
  npm test -- --testNamePattern="$MODULE" --passWithNoTests 2>&1 | tail -10
fi

exit 0
```

This hook runs the relevant tests after any source file edit, catching regressions immediately.

### Example 4: Notification When Claude Finishes

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/notify-complete.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/notify-complete.sh

# Send a desktop notification
if command -v osascript &>/dev/null; then
  # macOS
  osascript -e 'display notification "Claude Code has finished." with title "Claude Code"'
elif command -v notify-send &>/dev/null; then
  # Linux
  notify-send "Claude Code" "Task complete"
fi

# Optionally send a Slack message
# curl -s -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Claude Code task complete"}' \
#   "$SLACK_WEBHOOK_URL"

exit 0
```

This hook lets you walk away from your computer and get notified when Claude finishes.

### Example 5: Enforce Quality Gate Before Stop

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Before Claude stops, verify: (1) All unit tests pass. (2) No TypeScript type errors. (3) No ESLint errors. Run the commands to check each. Return ok: false if any check fails, with the failures in reason.",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

This hook runs a quality check agent before Claude stops. If tests fail or type errors exist, Claude is forced to keep working until they are fixed.

### Example 6: DB Connection Setup for Database Agents

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "sql-analyst",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/setup-db-tunnel.sh"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "sql-analyst",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/teardown-db-tunnel.sh"
          }
        ]
      }
    ]
  }
}
```

The setup script establishes an SSH tunnel to the database. The teardown script closes it. The sql-analyst agent always has a live connection while running, and the tunnel is cleaned up afterward.

---

## JSON Output Format

Hooks can influence Claude's behavior through their stdout. The base output format:

```json
{
  "continue": true,
  "stopReason": "Optional reason shown when continue is false",
  "suppressOutput": false,
  "systemMessage": "Optional warning shown to user"
}
```

For `PreToolUse` hooks that want to modify the tool input or make a permission decision:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "This is a read-only operation",
    "updatedInput": {
      "command": "ls -la /tmp"
    },
    "additionalContext": "Note: running with read-only permissions"
  }
}
```

The `updatedInput` field lets a hook modify the tool parameters before Claude uses them. This is powerful for sanitizing inputs, resolving paths, or adding flags to commands.

---

## Security Considerations

Hooks execute with your user permissions. Treat hook scripts like any other code running on your machine:

**Never trust hook input blindly.** The input JSON comes from Claude's tool calls. While Claude Code itself is trustworthy, always validate that the file paths or commands are in expected locations before acting on them.

**Use absolute paths in commands.** Environment variables may differ when hooks run. Use `$CLAUDE_PROJECT_DIR` for project-relative paths:

```json
{
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate.sh"
}
```

**Limit HTTP hook exposure.** If using HTTP hooks, ensure they are on localhost or behind authentication. The `allowedEnvVars` field controls which environment variables are exposed to the hook headers.

**Test hooks in isolation.** Before deploying a hook to a team repository, test it with sample inputs by piping JSON to it manually:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | .claude/hooks/validate-bash.sh
```

**View configured hooks with `/hooks`.** Run this command in any session to see all active hooks, where they come from, and what commands they run. This is essential for debugging unexpected hook behavior.

---

**Next up:** [Chapter 9 — Automated Workflows](./09-automated-workflows.md) — Running Claude Code in CI/CD, scripted usage with `--print`, and GitHub Actions integration.
