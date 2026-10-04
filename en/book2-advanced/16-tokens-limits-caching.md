# Tokens, Limits and Caching

> Verified on 2026-10-04 with Claude Code 2.1.289.

Three different meters run while you work, and most confusion about "usage" comes from mixing them up:

1. **The context window**, per session. How much the model can see at once. Running into it triggers compaction, not a bill. [Context Engineering](/en/book2-advanced/15-context-engineering) covers it.
2. **Plan limits**, on a Pro, Max, Team, or Enterprise subscription. A rolling five-hour session window and a weekly window. Claude Code shares these limits with the rest of your plan: per Anthropic's pricing page, your work in the terminal and your Claude chats draw from one pool.
3. **Dollars**, when you use an API key, a cloud provider, or usage credits past your plan's allowance.

The same habits move all three, but you diagnose them differently. This chapter covers the weekly limit changes of September 2026, how to read `/usage`, how prompt caching works in Claude Code (including the one-hour cache), and how effort and model choice change what each turn costs. For measuring spend across a team and setting budgets, see [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured).

## Weekly limits after September 14, 2026

From May 13 to September 13, 2026, Anthropic ran a promotion that made weekly limits in Claude Code 50% higher on Pro, Max, Team, and legacy seat-based Enterprise plans. Five-hour limits did not change.

When it ended, Anthropic kept part of it. Its support article states that "starting September 14, 2026, weekly limits in Claude Code are 25% higher than they were before the promotion." That is a permanent increase over the old baseline and a cut against the promotion: if the old weekly allowance was 100, the promotion made it 150, and from September 14 it is 125. BleepingComputer quoted Anthropic's own clarification: "Compared to today, this works out to a 17% reduction in weekly limits on Claude Code." Both numbers, 25% up and 17% down, describe the same change.

The help article describes the change as percentages against earlier limits, not as token counts, and how far an allowance goes depends on model, context size, and cache behavior. So the practical question is never "how many tokens do I get?" but "what is eating my allowance?" That is what `/usage` answers.

<!-- AUTHOR-DATA: the author's typical weekly-limit percentage used per week before and after September 14, 2026, from /usage, if available -->

## Reading `/usage`

`/usage` (aliases `/cost` and `/stats`) has three parts that matter:

- **Session block.** Token counts and an estimated dollar figure for the current session, computed locally at list price. On a subscription the dollar figure is not your bill; it is a size gauge. It resets on `/clear`.
- **Plan usage.** Bars for your session and weekly limits, plus activity stats.
- **Breakdown** (Pro, Max, Team, Enterprise). Recent usage attributed to skills, subagents, plugins, and individual MCP servers as percentages; behavior flags when something like long context or cache misses accounts for 10% or more of recent usage; and rows for the heaviest `/loop` and scheduled tasks. Press `d` or `w` to switch between the last 24 hours and the last 7 days.

The breakdown is computed from session history on this machine only. Usage from other devices or claude.ai is not in it.

Since v2.1.251 the Session block also has a prompt cache line, which is the single most useful diagnostic in this chapter:

```text
Prompt cache (main):   14 requests · 91% of input tokens from cache · 2 misses (last 6m 10s ago, 310.2k tokens re-cached) · 1 expected rebuild (compaction or tool-result clearing) · warm (1h TTL, last activity 40s ago)
```

Since v2.1.260 it names a likely cause for the last miss when it can, for example `likely cause: tool definitions changed`. It covers the main conversation only, not subagents.

For a live view, a status line script can read `rate_limits.five_hour.used_percentage`, `rate_limits.seven_day.used_percentage`, their `resets_at` times, and a `prompt_cache` object. See the status line docs.

### When you hit a limit

The message tells you which meter you hit:

- **"You've hit your session limit" / "You've hit your weekly limit"**: a plan window, shared across all models, so switching models does not help.
- **"You've hit your Opus limit" / "Sonnet limit"**: model-specific; switching to another model family with `/model` keeps you working.
- **A spend-limit message**: usage credits reached a cap you or your admin set.

Since v2.1.234, an interactive session signed in with a subscription waits and continues the interrupted task on its own when the limit resets. Keep the session open; press `Esc` to cancel. `/rate-limit-options` shows the choices: wait, add usage credits with `/usage-credits`, or upgrade.

## Why usage climbs

The docs list the usual reasons a long session costs more than it seems to:

- **Long context.** Every request carries the whole conversation. A one-line question in a session open all day still pays for the day.
- **Cache misses.** The first message after the cache expires reprocesses everything.
- **Things that run while you are idle.** Scheduled tasks, messages from other sessions, and goal check-ins each start a turn that sends your full context. Cross-session messages can be held with the `crossSessionInbound` setting set to `hold`.
- **Subagents, workflows, and agent teammates.** Each sends its own requests.
- **Compaction itself.** `/compact` reads the conversation it summarizes. `/clear` costs nothing.

Most of these are invisible in the terminal. All of them show up in the `/usage` breakdown, which is why it is worth checking weekly rather than only when you run out.

## Prompt caching in Claude Code

The model remembers nothing between requests, so Claude Code re-sends everything each turn. Prompt caching is what makes that affordable. The API caches the start of each request (the prefix) and, when the next request begins with the same bytes, bills the re-read at the cached rate and processes only what is new.

Two properties drive everything else:

- **The match is exact and ordered.** A change anywhere in the prefix recomputes everything after it. There is no per-file caching.
- **Claude Code orders requests so stable things come first:** system prompt and tool definitions, then project context (CLAUDE.md, auto memory, unscoped rules), then the conversation.

### What breaks the cache

These cause one slower, more expensive turn while the cache rebuilds:

- **Switching models** with `/model`. Each model has its own cache. `opusplan` switches model each time you enter or leave plan mode, and a skill whose frontmatter names another model switches for that turn.
- **Changing effort**, on most models. The exception: on Opus 5.5, Sonnet 5.5, and Fable 5.1, with an API key or a subscription, effort changes keep the cache (not on Bedrock, Google Cloud, a Claude apps gateway, or with HIPAA).
- **Turning on fast mode**, once per conversation.
- **Adding or removing tools** when tool search is not deferring them: connecting an MCP server, or a bare deny rule like `Bash`.
- **Compaction**, by design.
- **Many images.** When screenshots pass the per-request limit, Claude Code drops the oldest batch and the conversation reprocesses from there.
- **Upgrading Claude Code.** The first session after an upgrade builds from scratch.

What keeps it: editing files, editing CLAUDE.md mid-session (the edit waits for `/clear`, `/compact`, or a restart), changing permission mode or output style, invoking skills and commands, `/recap`, `/rewind`, and spawning subagents.

Claude Code asks before a model or effort switch that would throw away a warm cache. Read that prompt as a price tag.

### Cache lifetime: five minutes or one hour

Cached prefixes expire after inactivity. The API offers two lifetimes: five minutes, and one hour at a higher write price. Claude Code picks per request:

| Requests | Subscription, within plan usage | Usage credits, API key, or cloud provider |
|---|---|---|
| Main conversation (interactive turns, `-p` runs, Agent SDK turns) | One hour | Five minutes |
| Everything else (subagents, workflows, forks, compaction, titles) | Five minutes, except some server-controlled helpers | Five minutes |

Once a subscriber goes past the plan limit and draws on usage credits, the main conversation drops to five minutes. Anthropic's Opus 5.5 announcement (September 24, 2026) added the option for API-key and cloud-provider users to get the one-hour lifetime that subscribers already had. Set it yourself (v2.1.242 or later):

```json
{
  "promptCacheTtl": "1h",
  "subagentPromptCacheTtl": "5m"
}
```

The environment variables `CLAUDE_CODE_PROMPT_CACHE_TTL` and `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` do the same and take precedence over settings. Each accepts only `5m` or `1h`. `FORCE_PROMPT_CACHING_5M=1` overrides everything, which is useful when comparing the two.

Should you? The arithmetic, from the API pricing page: a five-minute cache write costs 1.25x the base input price, a one-hour write costs 2x, and a cache read costs 0.1x on most models (0.05x on Opus 5.5, 0.025x on Fable 5.1). On the standard multipliers, the five-minute cache pays for itself after one read and the one-hour cache after two. The one-hour lifetime wins when you leave sessions idle for more than five minutes and come back, which describes most real work with an agent that runs while you review. It loses on tight bursts that never pause.

To confirm which lifetime your writes used:

```bash
claude -p "hello" --output-format json
```

In the result, `usage.cache_creation` reports one-hour writes under `ephemeral_1h_input_tokens` and five-minute writes under `ephemeral_5m_input_tokens`.

### Subagents, forks and the cache

A subagent starts a new conversation with its own system prompt and tools, so it does not read the parent's cache and warms its own (on the five-minute lifetime by default). A fork, by contrast, inherits the parent's system prompt, tools, and history exactly, so its first request reads the parent's cache. That makes `/subtask` cheap for side tasks that need your context, and a fresh subagent the better choice for work that does not.

The cache is also effectively scoped to one machine and directory: the system prompt embeds auto memory paths and the working directory. Parallel sessions in the same directory share it; sessions in different worktrees do not.

### Check that it worked

Work normally for twenty minutes, then run `/usage`. A healthy session shows most input tokens served from cache (the example in the docs shows 91%) and few misses. If misses keep climbing, the likely-cause text tells you where to look, and the list above tells you what to stop doing mid-task.

## Effort and model choice

### Effort

Effort controls how much the model reasons on each step. Current models offer `low`, `medium`, `high`, `xhigh`, and `max` (Opus 4.6 and Sonnet 4.6 have no `xhigh`). Defaults per the docs: `medium` on Opus 5.5 and Sonnet 5.5, `xhigh` on Opus 4.7, and `high` everywhere else.

| Level | Use it for |
|---|---|
| `low` | Quick exchanges you review each time: a sketch, a rename |
| `medium` | Day-to-day work with clear scope (the default on the 5.5 models) |
| `high` | Bug fixes in existing code, work where edge cases matter |
| `xhigh` | Deeper reasoning at higher spend |
| `max` | Hard problems you want worked through unattended; prone to overthinking, session-only |

Ways to set it: `/effort` with a level or the slider (press `s` to apply to this session only instead of saving it), the `--effort` flag, `CLAUDE_CODE_EFFORT_LEVEL`, or `effort` in a skill's or subagent's frontmatter. `ultrathink` in a prompt asks for deeper reasoning on that one turn without changing the level. You cannot turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models; effort is the control there.

Anthropic's note on Opus 5.5 is a good general rule: at `medium` it matches or beats Opus 5 at `high` on their evaluations, so when you move to a new model, start at its default rather than carrying over your old level.

### Model

API list prices per million tokens, from the pricing page on 2026-10-04:

| Model | Input | Output | Cache read |
|---|---|---|---|
| Claude Fable 5.1 | $10 | $50 | $0.25 |
| Claude Opus 5.5 | $4 | $20 | $0.20 |
| Claude Opus 5 | $5 | $25 | $0.50 |
| Claude Sonnet 5.5 | $2 | $10 | $0.20 |
| Claude Haiku 4.5 | $1 | $5 | $0.10 |

On the Anthropic API the aliases resolve to `opus` = Opus 5.5, `sonnet` = Sonnet 5.5, and `fable` = Fable 5.1 (other providers differ; check the model configuration docs). Notice how input-heavy agent work is: Anthropic reported the input-to-output token ratio in Claude Code moving from 189:1 to 324:1 between March and September 2026. For long sessions, the cache read price matters as much as the headline price.

Practical rules:

- **Pick model and effort at the start of a session** and leave them. Lydia Hallie's guide on the Claude blog gives the same advice: set model and effort before you start, because changing either mid-conversation can bust the cache.
- **Use the default model for most work.** Reach for `fable` or `opus` at higher effort for long autonomous runs and hard debugging, not for renames.
- **Set cheaper models for simple subagents** with `model: haiku` in the subagent file, so a model switch in your main session does not drag every helper along.

## Hard caps for unattended runs

Watching a meter is not a budget. For headless runs, `--max-budget-usd` sets a dollar ceiling (it works only with `-p`/`--print`), and since July 2026 it also stops subagents from starting once spend reaches it:

```bash
claude -p "Fix the failing tests in packages/api" --max-budget-usd 5
```

`--output-format json` includes `total_cost_usd` per run, a client-side estimate you can log. Simon Willison argued on October 3, 2026 that agent-facing services need default hard budget caps, not warning emails; the same logic applies to your own automation. Organization-level caps (usage-credit spend limits, workspace limits, gateway spend limits) are covered in [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured).

## Habits that pay the most

In rough order of impact:

1. Do not switch model or effort mid-task.
2. `/clear` between unrelated tasks; `/compact` at natural breaks, before you step away.
3. Keep the baseline small (see [Context Engineering](/en/book2-advanced/15-context-engineering)).
4. Put noisy reads, logs, and test runs in subagents.
5. Check the `/usage` breakdown weekly, not only when blocked.
6. On an API key, try `promptCacheTtl: "1h"` and compare the cache line for a week.

## Check that it worked

1. Run `/usage` and find the `Prompt cache (main)` line. Note the hit percentage.
2. Run `claude -p "hello" --output-format json` and confirm which cache lifetime your writes used.
3. After a week of the habits above, compare the weekly bar and the breakdown with the previous week (press `w`). The flags for long context and cache misses should shrink or disappear.

## Sources

- "Claude Code May–August 2026 weekly limits promotion", Claude Help Center, Anthropic, accessed 2026-10-04. https://support.claude.com/en/articles/15910845-claude-code-may-august-2026-weekly-limits-promotion
- "Anthropic is cutting Claude Code's current weekly limits by 17 percent", Mayank Parmar, BleepingComputer, 2026-08-29. https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/
- "Manage costs effectively", Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/costs
- "How Claude Code uses prompt caching", Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- "Model configuration" (effort levels, aliases), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- "Interactive mode" (Wait for a usage limit to reset), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- "Customize your status line" (rate limit and prompt cache fields), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/statusline
- "Run Claude Code programmatically" (`total_cost_usd`), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/headless
- "Pricing" (model prices, prompt caching multipliers), Claude Platform Docs, accessed 2026-10-04. https://platform.claude.com/docs/en/about-claude/pricing
- "Pricing" (plans; Claude Code shares usage limits with Claude chat), Anthropic, accessed 2026-10-04. https://claude.com/pricing
- "Opus 5.5 built for coding sessions that use more context", Michael Segner, Anthropic (Claude blog), 2026-09-24. https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context
- "Maximizing the value of your Claude Code sessions", Lydia Hallie, Anthropic (Claude blog), 2026-08-14. https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions
- "We're going to need default hard budget caps on pretty much everything", Simon Willison, 2026-10-03. https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/
- What's new, Week 30 (July 20–24, 2026: `--max-budget-usd` applies to subagents), Anthropic. https://code.claude.com/docs/en/whats-new/2026-w30
- `claude --help`, Claude Code 2.1.289 (`--max-budget-usd`, `--effort`, `--autocompact`).
