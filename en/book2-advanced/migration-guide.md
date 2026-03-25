# Appendix D: Migration Guide

This guide helps developers coming from other AI coding tools transition to Claude Code. Each section addresses the mental model shifts, equivalent features, and practical steps for switching from a specific tool.

---

## Migrating from GitHub Copilot

### Mental Model Shift

Copilot lives inside your editor and completes code as you type. It is fundamentally an autocomplete accelerator — you lead, it follows.

Claude Code is a conversational agent in your terminal. You describe goals, it executes them. The interaction model is fundamentally different: you are having a conversation, not receiving inline suggestions.

| Copilot | Claude Code |
|---------|-------------|
| Inline code completion | Describe what you want in plain language |
| Tab to accept suggestions | Review and approve changes |
| Works file-by-file as you type | Works across multiple files holistically |
| No memory of your project | Learns your project through CLAUDE.md and auto memory |
| No tool execution | Can run tests, lint, git, and other commands |
| Editor-native | Terminal-native (also available in VS Code extension) |

### Feature Equivalents

| Copilot Feature | Claude Code Equivalent |
|----------------|----------------------|
| Inline completion | Not applicable (different model) — describe the function in chat |
| Copilot Chat | Main Claude Code conversation |
| Explain this code | "Explain how this function works" in conversation |
| Fix this | "Fix the error in [file]" or paste the error message |
| Generate tests | "Write unit tests for [function]" |
| Explain shell command | "What does this command do: [command]" |

### Practical Transition Steps

1. **Install Claude Code alongside Copilot.** You do not need to uninstall Copilot. Many developers use both: Copilot for inline completion while typing, Claude Code for larger tasks and conversations.

2. **Start with tasks Copilot is bad at.** Multi-file changes, debugging sessions, code review, and understanding large codebases are where Claude Code adds the most value.

3. **Learn to describe goals, not instructions.** Instead of "write a function that..." (Copilot style), try "implement a rate limiter for our API endpoints following the pattern in src/middleware/auth.ts" (Claude Code style).

4. **Create a CLAUDE.md.** This is the primary way to give Claude Code persistent project knowledge — equivalent to nothing in Copilot, which reads no persistent configuration.

```bash
# Generate a starter CLAUDE.md
claude
/init
```

5. **Evaluate after 2 weeks.** Claude Code's value compounds as it learns your project and you learn to work with it. Give it meaningful time before evaluating.

---

## Migrating from Cursor

### Mental Model Shift

Cursor is a full IDE fork of VS Code with AI integrated throughout. Claude Code is a terminal-first tool that also has a VS Code extension but is not an IDE replacement.

The deeper difference: Cursor's AI features are designed around the editor workflow (inline edits, sidebar chat, Composer for larger tasks). Claude Code is designed around an agent workflow — it takes larger goals and executes them across tools, files, and commands.

| Cursor | Claude Code |
|--------|-------------|
| Editor-integrated AI | Terminal-first (also VS Code extension) |
| Inline editing (Ctrl+K) | Conversational instruction + approval |
| Composer for multi-file | Natural language multi-file tasks |
| .cursorrules file | CLAUDE.md (similar concept, more powerful) |
| Chat sidebar | Full terminal session |
| Cursor context | Explicit file references + CLAUDE.md |

### Feature Equivalents

| Cursor Feature | Claude Code Equivalent |
|---------------|----------------------|
| Inline edit (Ctrl+K) | Type instruction in conversation |
| Composer | Standard Claude Code conversation |
| .cursorrules | CLAUDE.md (with more capabilities: imports, path-scoped rules) |
| @-mentions in chat | `@file.ts` syntax in conversation, or "read src/..." |
| Apply to codebase | Normal Claude Code multi-file changes |
| Terminal integration | Native terminal execution |
| Chat history | Session history via `claude --resume` |

### Migrating Your .cursorrules

Cursor's `.cursorrules` file is similar in concept to CLAUDE.md. Most .cursorrules content can be directly migrated:

```bash
# If you have a .cursorrules file
cp .cursorrules CLAUDE.md
```

Then review and enhance it:
- Add build/test commands (Claude Code needs these; Cursor usually detects them from the editor)
- Remove any rules that were Cursor-specific (editor keybindings, Cursor-specific @ references)
- Convert overly long paragraphs to concise bullet points for better adherence

### Practical Transition Steps

1. **Use the VS Code extension for familiarity.** The Claude Code VS Code extension provides inline diffs, @-mentions, and conversation history inside VS Code — closer to the Cursor experience while you transition.

```
VS Code Extensions → Search "Claude Code" → Install
```

2. **Migrate .cursorrules to CLAUDE.md.** Start with a direct copy and refine over time.

3. **Learn the terminal workflow for larger tasks.** Complex multi-file changes, debugging, and automation tasks are better handled in the terminal where Claude Code has full tool access.

4. **Explore hooks.** Claude Code hooks provide automation capabilities (auto-lint after edits, pre-commit checks) that Cursor handles through AI suggestions — hooks are more reliable because they are deterministic.

---

## Migrating from Aider

### Mental Model Shift

Aider is the closest existing tool to Claude Code in philosophy. Both are terminal-based, both work with your actual codebase, both can make multi-file changes. The main differences are in scope and integration:

| Aider | Claude Code |
|-------|-------------|
| Git-focused workflow | Broader: files, git, commands, web, MCP |
| `/add` files explicitly | Claude reads files proactively as needed |
| Architect + editor mode | Single agent with extended capabilities |
| Minimal persistence | CLAUDE.md + auto memory |
| No MCP | Full MCP integration |
| No subagent support | Multi-agent orchestration |
| Open-source, local model option | Anthropic-hosted |

### Feature Equivalents

| Aider Feature | Claude Code Equivalent |
|--------------|----------------------|
| `/add file.py` | Reference files in conversation; Claude reads on demand |
| `/run command` | Claude runs commands natively as part of tasks |
| `/commit` | "Commit these changes" in conversation |
| `/ask` (read-only mode) | Plan Mode (Shift+Tab) |
| `/architect` | Plan Mode for design, then Normal Mode for implementation |
| `.aider.conf.yml` | CLAUDE.md and settings.json |
| `--model gpt-4` | `claude --model claude-sonnet-4-6` |
| Repo map | Claude reads files on demand; auto memory accumulates structure |
| `--watch` (auto mode) | Claude Code hooks for automated responses |

### Practical Transition Steps

1. **Unlearn explicit file management.** Aider requires you to `/add` files before working with them. Claude Code reads files on demand as it needs them. This is initially surprising — you do not need to tell Claude what files to look at.

2. **Move configuration to CLAUDE.md.** Aider's configuration file maps well to CLAUDE.md. Bring over your conventions and command preferences.

3. **Explore MCP for integrations.** If you used Aider with external tools via shell commands, those integrations become more capable via MCP servers.

4. **Try multi-agent patterns.** Aider is single-agent. Claude Code's subagent support enables workflows like parallel file analysis and writer/reviewer separation that significantly improve quality on complex tasks.

5. **Adjust to the approval model.** Aider's interactive diffs and Claude Code's approval model serve the same purpose. Claude Code's is more integrated — you review in the same terminal session without switching views.

---

## Migrating from ChatGPT / Web Claude

### Mental Model Shift

Web-based AI assistants (ChatGPT, Claude.ai) are conversational tools. You describe problems, they suggest solutions, you implement them. Claude Code collapses the implementation gap — it reads your files directly and makes changes.

This is the most significant mental model shift. Web AI users have learned to describe problems carefully in text. Claude Code users describe goals and let Claude do the implementation.

| Web AI (ChatGPT/Claude.ai) | Claude Code |
|---------------------------|-------------|
| Paste code snippets | Claude reads your actual files |
| Receive code suggestions | Claude writes and edits directly |
| Copy-paste to implement | Changes applied automatically (with approval) |
| No project context | CLAUDE.md provides persistent context |
| No command execution | Runs tests, git, linters, etc. |
| No memory between sessions | CLAUDE.md + auto memory |

### The Biggest Adjustment: Stop Copy-Pasting

The most common adjustment for web AI users: stop copying code between the AI and your editor. With Claude Code:

```bash
# Instead of: describe problem → copy code → paste into editor
# Do: describe problem → Claude edits file directly
```

```text
# Old web AI pattern (describe the code you want)
"Write me a function that validates email addresses using regex"

# Claude Code pattern (describe the goal in your project)
"Add input validation to the email field in src/auth/signup.ts.
Use the same validation pattern as the phone field."
```

### Practical Transition Steps

1. **Start with your next bug fix.** Instead of pasting an error into ChatGPT, paste it into Claude Code. Claude can read the actual file and see the full context.

2. **Learn to reference files.** When discussing code with Claude Code, reference the actual file rather than pasting content: "Look at src/api/handlers/user.ts and explain the error handling pattern."

3. **Create a CLAUDE.md immediately.** Web AI sessions have no memory between conversations. Claude Code sessions have CLAUDE.md and auto memory. Set this up early to get value from the persistence.

4. **Embrace longer-horizon tasks.** Web AI is good for one-shot answers. Claude Code is good for tasks that require multiple steps, file reads, and command execution. Shift your prompts toward multi-step goals.

---

## General Migration Principles

Regardless of which tool you are migrating from, these principles accelerate the transition:

**1. Invest in CLAUDE.md early.** Every other AI tool requires you to re-explain your project every session. CLAUDE.md ends this. The sooner you create a good CLAUDE.md, the sooner you get the compounding benefit.

**2. Start with one task category.** Pick the task type where your current tool frustrates you most (often: multi-file refactoring, debugging, or code review). Master that use case before expanding.

**3. Accept the approval model.** Every tool that can modify files should require review before applying changes. Claude Code's approval model is well-designed. Do not rush to bypass it — engage with it.

**4. Use `/clear` liberally.** Coming from editor-based tools, the concept of a "context window" that needs management is unfamiliar. When switching to a new task, clear the context. This habit prevents a lot of quality degradation.

**5. Give it two weeks minimum.** The benefit of Claude Code compounds as it learns your project and you learn to work with it. A two-day evaluation is not representative of sustained use.

---

## Coexistence: Using Claude Code Alongside Other Tools

Claude Code does not require you to abandon other tools. Many experienced developers use:

- **Copilot for inline completion** (typing assistance) + **Claude Code for larger tasks** (multi-file changes, debugging)
- **Cursor as the editor** + **Claude Code in the terminal** for complex tasks
- **Aider for git-focused workflows** + **Claude Code when MCP integrations are needed**

The tools are complementary, not mutually exclusive. Optimize for the workflow, not for tool exclusivity.
