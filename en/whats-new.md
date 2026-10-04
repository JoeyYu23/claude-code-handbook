# What's New in the Second Edition

> Written 2026-10-04.

The first edition came out in March 2026. It taught you how to work with one agent: approve its steps, read its changes, keep its context tidy. Six months later that is no longer how most people work. Agents now write most of the code, you no longer read every line, and auto mode starts every session. This edition is rebuilt around that change.

The first edition is still online at [/v1/](/v1/). The [migration guide](/en/book3-architect/migration-guide) maps every old chapter to where it lives now.

## Five shifts this edition is built on

### 1. Checking the work replaces reading the code

Practitioners such as Thorsten Ball, Addy Osmani and Geoffrey Huntley argue that line-by-line review is ending for most code. That does not remove the human; it moves the human to specifying the task and checking the result. The agent's job is to prove its work with tests, evals, screenshots and done-checks.

Read: [Check the Work](/en/book1-getting-started/12-check-the-work), [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals), [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents).

### 2. The harness matters as much as the model

Everything around the model (instructions, tools, skills, MCP servers, hooks, memory) decides what it sees and what it costs. Studies this summer measured how much the harness changes results, and one widely discussed measurement put Claude Code's per-request baseline at about 33,000 tokens. This edition shows you how to measure and trim your own.

Read: [How It Works](/en/book1-getting-started/03-how-it-works), [Context Engineering](/en/book2-advanced/15-context-engineering), [Harness Engineering](/en/book3-architect/01-harness-engineering), [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill).

### 3. Many agents at once is normal

Background and nested subagents, forks, the agent view, cross-session messages, routines and cloud sessions all arrived between May and September. Anthropic, OpenAI, Cursor and GitHub shipped similar controls in the same quarter.

Read: [Subagents](/en/book2-advanced/05-subagents), [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions), [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents), [Scheduled Agents and Routines](/en/book3-architect/06-scheduled-agents-routines), [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents).

### 4. Auto mode is the default, so containment matters

Since 14 August 2026, a classifier approves most actions instead of you. That makes the question less "should I approve this?" and more "what is the agent able to reach at all?": deny rules, sandboxes, isolation, prompt injection and spend caps.

Read: [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions), [Worktrees](/en/book2-advanced/08-worktrees), [Containment and Security](/en/book3-architect/09-containment-and-security).

### 5. Cost and portability are everyday concerns

Weekly limits changed, prices fell, and prompt caching now drives most of the bill. Claude Code reads `AGENTS.md` since version 2.1.277, and many teams run more than one coding agent.

Read: [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching), [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured), [CLAUDE.md and AGENTS.md](/en/book1-getting-started/14-claude-md), [Portability](/en/book3-architect/11-portability).

## New chapters

- [Check the Work](/en/book1-getting-started/12-check-the-work) (replaces Debugging)
- [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill)
- [Agents That See](/en/book2-advanced/14-agents-that-see)
- [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals)
- [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents)
- [Portability: Many Tools, Many Models](/en/book3-architect/11-portability)
- [The Builder's Job Now](/en/book3-architect/13-builders-job-now)
- [Who to Follow](/en/who-to-follow)

## Rewritten or merged

- Permissions became [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions).
- Parallel agents and multi-session work became [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions).
- Four MCP chapters became [MCP in Practice](/en/book2-advanced/12-mcp-in-practice), plus the decision guide above.
- Plugins became [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods).
- Context, tokens, subagents, harness engineering, agent teams, security and cost were rewritten from scratch.

## Corrections to the first edition

Every command, flag and setting in this edition was checked against the official documentation or the Claude Code CLI on 2026-10-04. That check found real mistakes in the first edition, including commands that never existed (`claude worktree list`, `claude teleport revoke`, `/plugin create`), a hook example that read its input the wrong way and used the wrong exit code to block, a `.claudeignore` file that has no effect, and keyboard shortcuts that were wrong. They are fixed here. If you followed the first edition, the [migration guide](/en/book3-architect/migration-guide) is worth a skim.

## How this edition is written

- Each chapter says when it was verified and with which version.
- Each how-to ends with a way to check that it worked.
- Each chapter ends with dated sources. Claims from people outside Anthropic are attributed to them.

Claude Code changes every week. When something here no longer matches what you see, the date at the top of the chapter tells you how old the check is. Issues and pull requests are welcome on [GitHub](https://github.com/JoeyYu23/claude-code-handbook).
