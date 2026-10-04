# Book 2: Power User

> Verified on 2026-10-04 with Claude Code 2.1.289.

Book 1 taught you to work with one agent in one session. Book 2 is for developers who use Claude Code every day and want more out of it: commands and skills that encode your workflow, plugins and mods that extend the tool itself, subagents and parallel sessions, hooks and MCP, and the context and cost discipline that keeps all of it fast.

The theme running through this edition is that you no longer read every line the agent writes. So the chapters lean on three habits: give the agent a way to check its own work, keep the harness (what loads into every session) small and audited, and measure before you trust a skill, plugin or setting.

## Contents

### Part I: Commands, skills and plugins

1. [Slash Commands](/en/book2-advanced/01-slash-commands): the built-ins that matter, including `/goal`, `/fork`, `/usage`, `/doctor`, `/code-review` and `/design`
2. [Custom Skills](/en/book2-advanced/02-custom-skills): writing skills, and keeping a skill library healthy with `/skill-doctor`
3. [Skill Composition](/en/book2-advanced/03-skill-composition): stacking and chaining skills into workflows
4. [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods): installing, testing with `claude plugin eval`, publishing, and the power and risk of mods

### Part II: Agents and sessions

5. [Subagents](/en/book2-advanced/05-subagents): background, nested and forked subagents, and when not to use them
6. [Agent Catalog](/en/book2-advanced/06-agent-catalog): built-in agent types and custom agent files
7. [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions): `claude agents`, cross-session messaging, many sessions on one machine
8. [Worktrees](/en/book2-advanced/08-worktrees): parallel work in isolated checkouts, and why a worktree is not a security boundary

### Part III: Hooks, automation and tools

9. [Hooks](/en/book2-advanced/09-hooks): lifecycle events, and when a hook beats a mod
10. [Automated Workflows](/en/book2-advanced/10-automated-workflows): headless runs and workflows that script many subagents
11. [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill): choosing how to give the agent a capability
12. [MCP in Practice](/en/book2-advanced/12-mcp-in-practice): adding servers, a database example, writing a small server
13. [Custom Tools](/en/book2-advanced/13-custom-tools): extending what Claude can call
14. [Agents That See](/en/book2-advanced/14-agents-that-see): artifacts, the in-app browser, simulators and computer use for checking UI work

### Part IV: Context, cost and memory

15. [Context Engineering](/en/book2-advanced/15-context-engineering): compaction, prompt audits and a small baseline
16. [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching): weekly limits, `/usage`, prompt caching, effort and model choice
17. [Memory Architecture](/en/book2-advanced/17-memory-architecture): when external memory or a code graph helps, and when it hurts
18. [Large Projects](/en/book2-advanced/18-large-projects): brownfield codebases and agent-written docs

### Part V: Surfaces and speed

19. [Desktop and Web](/en/book2-advanced/19-desktop-and-web): what the desktop and web apps add
20. [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort): speed and reasoning depth, and changing them mid-session

## How to read this book

Parts I and IV pay off for everyone; read them first. Part II matters once you run more than one task at a time. Part III is reference material you will come back to when you automate something. If you are coming from the first edition, the [migration guide](/en/book3-architect/migration-guide) maps every old chapter to its new home; the first edition itself stays readable at [/v1/](/v1/en/book2-advanced/).

When you finish, [Book 3: Architect](/en/book3-architect/) covers verification at scale, orchestrating many agents, containment and cost.

### Check that it worked

Run `claude --version` in your shell. If it prints a version older than 2.1.289, run `claude update` first: several chapters in this book rely on recent commands, and each notes the minimum version where it matters.

## Sources

- Claude Code documentation index, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/llms.txt
- `claude --help`, Claude Code 2.1.289, run 2026-10-04.
