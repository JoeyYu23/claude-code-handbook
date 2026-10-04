# Glossary

> Verified on 2026-10-04 with Claude Code 2.1.289.

Plain-language definitions for terms in this book. Claude Code terms follow Anthropic's own glossary; general programming terms are explained informally.

## A

**Agent.** A program that takes actions, not just produces text. Claude Code reads files, runs commands, and edits code. A plain chatbot only writes text for you to act on.

**Agent view.** A screen in the terminal that lists your background Claude Code sessions, grouped by state (needs input, working, completed), so you can manage many at once. Open it with `claude agents`, or press the left arrow on an empty prompt. Anthropic labels it a research preview. See [Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions).

**Agentic loop.** The cycle Claude works through on every task: gather context, take an action, check the result, repeat until done. You can interrupt it at any point.

**AGENTS.md.** A Markdown file of instructions for AI coding agents, used by several tools. Since Claude Code 2.1.277, if your repository has one and no CLAUDE.md, Claude reads it as your project instructions. See [CLAUDE.md and AGENTS.md](/en/book1-getting-started/14-claude-md).

**API key.** A secret string that identifies you to a service. Treat it like a password: keep it in an environment variable, never in a file you commit to git.

**Auto memory.** Notes Claude writes to itself from your corrections and preferences, stored on your computer under `~/.claude/projects/`. See [Memory](/en/book1-getting-started/15-memory).

**Auto mode.** A permission mode in which a second model, the classifier, reviews Claude's actions instead of you, so most run without a prompt. It blocks things like going beyond what you asked, touching unrecognized infrastructure, or acting on instructions hidden in content Claude read. In Claude Code 2.1.283 and later it is the starting mode for interactive terminal and VS Code sessions. See [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions).

## B

**Branch (git).** An independent line of work in a git repository, so you can change things without touching the main version. See [Git Workflows](/en/book1-getting-started/10-git-workflows).

**Bash.** A common command-line interpreter. Claude Code uses a Bash tool to run commands on your machine. Typing `!` at the start of a prompt runs a command directly.

## C

**CLI (command-line interface).** A program you use by typing commands. Claude Code's terminal interface is a CLI.

**CLAUDE.md.** A Markdown file of persistent instructions you write for Claude. It loads at the start of every session. It can live at project, user, or organization level.

**Command.** Something you invoke by typing `/name`, such as `/clear`, `/model` or `/compact`. Older material calls these "slash commands" and "custom commands"; custom ones are now packaged as skills.

**Commit.** A saved snapshot of your project in git, with a message explaining what changed.

**Compaction.** Summarizing a long conversation automatically when the context window nears its limit: older tool output is cleared first, then the conversation is summarized. The project-root CLAUDE.md and auto memory survive and reload from disk; instructions you gave only in chat may be lost. Run `/compact` to do it yourself.

**Context window.** Claude's working memory for a session: your conversation, file contents, command output, CLAUDE.md, and more. Think of a desk with limited space. Run `/context` to see what is using it.

## D

**Default mode (Manual).** The permission mode where Claude asks before most edits and commands. The setting is called `default`; screens label it Manual.

**Diff.** A view of what changed between two versions of a file: removed lines and added lines. Claude shows diffs of proposed edits.

## E

**Effort level.** A setting for how much reasoning Claude applies on each step. Lower is faster and cheaper; higher thinks harder. Set it with `/effort`. The levels depend on the model: `low`, `medium`, `high`, `xhigh` and `max` on the current models, without `xhigh` on Opus 4.6 and Sonnet 4.6. See [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort).

**Environment variable.** A named value stored in your system environment rather than in code. API keys usually live here.

**Extended thinking.** Visible step-by-step reasoning the model does before answering.

## F

**Fork.** A subagent that inherits your whole conversation so far, instead of starting blank. Start one with `/subtask <task>` (named `/fork` on versions 2.1.161 to 2.1.211). It runs in the background and returns its result to your conversation. Not to be confused with a git or GitHub fork, which is a personal copy of a repository.

**Frontmatter.** A block of settings at the very top of a Markdown file between two `---` lines. Skills, subagents and rule files read their configuration from it.

## G

**Git / GitHub.** Git tracks changes to files over time. GitHub is a website for hosting git repositories and collaborating through pull requests.

**Glob pattern.** A short pattern for matching file paths: `*` matches within one folder, `**` matches across folders. `src/**/*.js` matches every `.js` file under `src/`.

## H

**Harness.** The software around the model that turns it into a coding agent: file access, running commands, permission checks, loading memory, and the loop that chains steps together. Claude Code is the harness; Claude is the model inside it. Anthropic's term is "agentic harness". See [Harness Engineering](/en/book3-architect/01-harness-engineering).

**Hook.** A handler that runs automatically at a fixed point in Claude Code's lifecycle, such as before a tool runs or after a file edit. Unlike instructions in CLAUDE.md, hooks always fire. See [Hooks](/en/book2-advanced/09-hooks).

## I

**IDE.** Integrated development environment: a code editor with built-in tools. VS Code, Cursor and the JetBrains editors are IDEs. See [IDE Integration](/en/book1-getting-started/16-ide-integration).

## M

**Markdown.** A simple text format: `# Heading`, `**bold**`. CLAUDE.md files are Markdown.

**MCP (Model Context Protocol).** An open standard for connecting Claude to outside tools and data, such as Slack, a database, or a browser. An MCP server is the program that provides them.

**Mod.** A plugin that changes how Claude Code looks and behaves. It is made of JavaScript or TypeScript event handlers that run inside Claude Code, and can draw panes, add commands or step into tool calls. A mod runs with your permissions, so install only from authors you trust. See [Plugins, Marketplaces and Mods](/en/book2-advanced/04-plugins-marketplace-mods).

## N

**Non-interactive mode.** Running one prompt and exiting, with `claude -p`. Used in scripts and automation. Older material calls it "headless mode".

## P

**Permission mode.** The baseline for how much Claude may do without asking. Press `Shift+Tab` to cycle. The modes are `default` (Manual), `acceptEdits`, `plan`, `auto`, `dontAsk` and `bypassPermissions`. Which of them appear in the cycle depends on your setup.

**Plan mode.** A permission mode where Claude researches and proposes changes without editing your files, then waits for your approval.

**Plugin.** A bundle of skills, hooks, subagents and MCP servers installed as one unit.

**Prompt.** The message you type to Claude.

**Pull request (PR).** A proposal to merge a branch into the main codebase, usually reviewed first.

## R

**Repository (repo).** A project tracked by git, with all its files and history.

**Routine.** A saved Claude Code setup (a prompt, one or more repositories, and connectors) that runs automatically on Anthropic's cloud, so it works with your laptop closed. It can start on a schedule, from an API call, or on a GitHub event. Create one at claude.ai/code/routines or with `/schedule`. Anthropic labels routines a research preview. See [Scheduled Agents and Routines](/en/book3-architect/06-scheduled-agents-routines).

**Rules.** Instruction files in `.claude/rules/` that load alongside CLAUDE.md, optionally only when Claude touches matching files.

## S

**Session.** One conversation with Claude Code in a directory, with its own context window. Resume with `claude --continue` or `claude --resume`.

**Skill.** A `SKILL.md` file with instructions or a workflow that Claude loads when relevant, or that you invoke with `/skill-name`. See [Custom Skills](/en/book2-advanced/02-custom-skills).

**Subagent.** A helper that works in its own context window on a delegated task and reports a summary back. See [Subagents](/en/book2-advanced/05-subagents).

## T

**Terminal.** A text window where you type commands. Claude Code runs in it.

**Token.** The unit a model reads and writes: roughly three quarters of an English word. Tokens drive cost and context limits.

**Tool.** An action Claude can take: read a file, edit code, run a command, search the web.

## V

**Verification loop.** A check Claude can run itself, such as a test suite, so it keeps working until the check passes instead of stopping at "looks right". See [Check the Work](/en/book1-getting-started/12-check-the-work).

**Vim mode.** An optional editing mode for the prompt box with Vim-style keys. Turn it on in `/config` under Editor mode. (The old `/vim` command was removed.)

## W

**Worktree.** An extra checked-out copy of a repository in a separate folder, so parallel agents do not overwrite each other. See [Worktrees](/en/book2-advanced/08-worktrees).

## Sources

- Anthropic, Claude Code Glossary, accessed 2026-10-04. https://code.claude.com/docs/en/glossary
- Anthropic, "Mods overview", accessed 2026-10-04. https://code.claude.com/docs/en/plugins/mods/overview
- Anthropic, "Automate work with routines", accessed 2026-10-04. https://code.claude.com/docs/en/routines
- Anthropic, "Agent view", accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- Anthropic, "Create custom subagents" (fork section), accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- Anthropic, "Model configuration" (effort levels), accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- Anthropic, Claude Code commands reference, accessed 2026-10-04. https://code.claude.com/docs/en/commands
