# Cost Reality, Measured

> Verified on 2026-10-04 with Claude Code 2.1.289.

The first edition of this chapter published seven weeks of one heavy user's spend and concluded that a top-tier subscription was a bargain. The numbers were real for that person in early 2026. They are not a guide for you now: prices, models, plan limits and caching have all changed since, and they will change again before you finish reading this book.

So this chapter gives you a method instead. It covers what you are paying for, how to measure your own usage with the tools Claude Code ships, how to decide between a subscription and the API, what moves the number, and where to put hard caps so an agent can't run up a bill while you sleep.

## What you are paying for

There are four ways to pay for Claude Code, and they meter differently.

| Route | How you pay | What limits you |
|---|---|---|
| Pro, Max | Flat monthly fee | A rolling five-hour window plus a weekly window |
| Team, Enterprise | Per seat (Enterprise adds usage at API rates) | Per-seat allowance; admin spend limits |
| Claude Console (API) | Per token | Workspace spend and rate limits you set |
| Bedrock, Agent Platform, Foundry | Per token, through your cloud bill | Your cloud's budget controls and quotas |

Prices on claude.com/pricing on 4 October 2026, in US dollars:

| Plan | Price | Usage, as the page describes it |
|---|---|---|
| Pro | $20 a month billed monthly, or $17 a month billed annually ($200 up front) | At least 5x Free per five-hour session |
| Max | From $100 a month | 5x or 20x Pro per five-hour session |
| Team, Standard seat | $20 per seat a month annually, $25 monthly | More than Pro |
| Team, Premium seat | $100 per seat a month annually, $125 monthly | 5x a Standard seat |
| Enterprise | $20 per seat a month, billed annually, plus usage at API rates | Admin-set user and org spend limits |

Three things on that page matter more than the headline prices. First, no plan states a token or message count: "there's no fixed message count", and Anthropic reserves the right to add other caps. Second, when you hit a limit on a paid plan you can turn on usage credits, which bill at standard API rates. Third, Enterprise is now a seat fee plus API-rate usage, so an Enterprise rollout is budgeted like API spend, not like a flat subscription. (The first edition also said Team Standard seats don't include Claude Code. The current Team plan lists Claude Code for the plan; the seat types differ in how much usage they get.)

The Claude Code docs give one population figure worth anchoring on: across enterprise deployments, the average is around $13 per developer per active day and $150 to $250 per developer per month, with 90% of users below $30 per active day. Your number depends on model, codebase and how many agents you run, which is why you measure.

For per-token routes, here are list prices for the models you will meet most, per million tokens:

| Model | Input | Cache hit | Output |
|---|---|---|---|
| Claude Fable 5.1 | $10 | $0.25 | $50 |
| Claude Opus 5.5 | $4 | $0.20 | $20 |
| Claude Opus 5 | $5 | $0.50 | $25 |
| Claude Sonnet 5.5 | $2 | $0.20 | $10 |
| Claude Haiku 4.5 | $1 | $0.10 | $5 |

Writing to the cache costs 1.25x the input price for the five-minute cache and 2x for the one-hour cache. US-only inference (`inference_geo: "us"`) adds 1.1x. Check the pricing page before you budget; this table is a snapshot.

## Measure your own usage

You need four numbers, each from a different tool. None of them needs anything beyond Claude Code and, optionally, one open-source reader for local logs.

### 1. Per session: `/usage`

`/usage` (also `/cost` and `/stats`) shows a Session block with tokens per model and a dollar figure. Claude Code computes that figure locally at list price, so on a subscription it is an "API-equivalent" estimate, not a charge. The `Prompt cache (main)` line shows what share of input came from cache and how many misses you had. [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) explains how to read both lines.

### 2. Against your plan: the `/usage` breakdown

On Pro, Max, Team and Enterprise, the same screen shows your session and weekly bars, and a breakdown of what consumed them: shares for skills, subagents, plugins and individual MCP servers, flags for long context or cache misses when one accounts for 10% or more, and your heaviest `/loop` and scheduled tasks. Press `w` for the last seven days. The breakdown is computed from this machine's history only, so work on other devices or on claude.ai isn't in it.

### 3. Over time: local logs

Claude Code keeps session transcripts on disk. The open-source `ccusage` tool (not affiliated with Anthropic) reads them and prices them at list rates:

```bash
npx ccusage@latest claude weekly --breakdown   # API-equivalent per week, split by model
npx ccusage@latest claude session --json       # per session, machine-readable
```

For headless jobs, log what each run reports. `claude -p --output-format json` includes `total_cost_usd`, a client-side estimate:

```bash
claude -p "Run the test suite and fix failures" --output-format json \
  | jq '{subtype, total_cost_usd}' >> ~/agent-costs.jsonl
```

### 4. The bill

The authoritative numbers are wherever you pay: the Console usage page for API keys, the spend report in org analytics on Team and Enterprise (it covers usage-credit spend), and your cloud billing console on Bedrock, Agent Platform or Foundry. For a team, export OpenTelemetry metrics (`claude_code.cost.usage` and `claude_code.token.usage`) to your own observability stack; it is the only option that works on every setup and gives per-user numbers in near real time. If your organization pays contracted rates, set the `modelPricing` managed setting so `/usage`, the status line and OpenTelemetry report at your rates instead of list price.

### A two-week protocol

Pick a normal fortnight, not a launch week. At the same time each week, record:

| Metric | Where | Week 1 | Week 2 |
|---|---|---|---|
| Weekly limit used (%) | `/usage` | <!-- AUTHOR-DATA: author's weekly limit % --> | |
| API-equivalent cost ($) | `ccusage claude weekly` | <!-- AUTHOR-DATA: author's weekly API-equivalent cost --> | |
| Share on the most expensive model (%) | `ccusage ... --breakdown` | <!-- AUTHOR-DATA: author's share of spend on top model --> | |
| Cache hit share (%) | `/usage` Prompt cache line | | |
| Top attribution rows | `/usage` breakdown | | |
| Changes merged | Your git host | | |

Then compute three ratios:

- **Leverage**: monthly API-equivalent cost divided by what you pay. Below 1, per-token billing would have been cheaper.
- **Headroom**: how close the weekly bar gets to 100%. If you hit it most weeks, the limit is costing you time, which is money too.
- **Cost per merged change**: API-equivalent cost divided by changes that shipped. This is the number to watch when you add agents. Tokens that don't end in merged work are waste, however cheap they look.

<!-- AUTHOR-DATA: the author's own leverage and cost per merged change for two recent weeks, with plan name -->

Treat API-equivalent figures with care. They price what you did at list rates, but people use a subscription differently from a meter: more parallel agents, longer sessions, a bigger model by default. Moving to the API would change the behavior as well as the bill.

### Check that it worked

After a week, you should have one row per week in your table with every cell filled from a tool, not from memory. `npx ccusage@latest claude weekly` should show the same week's totals each time you run it, and the `/usage` seven-day view should name at least one attribution row. If ccusage shows nothing, run it on the machine where the sessions ran: it reads local transcripts, so work done in cloud sessions or on another computer won't appear.

## Subscription or API?

Use the measurements, not intuition.

- **Interactive, bursty work by one person**: a subscription, if your leverage is above 1 and you rarely hit the weekly bar. Remote Control, cloud sessions, `--teleport` and ultrareview also need a claude.ai login.
- **CI, scheduled jobs and anything inside a product**: the API, through a Console workspace. You get per-key attribution, workspace spend limits, and a rate limit that keeps Claude Code from starving other production traffic. Claude Managed Agents is available only through the API and Claude Platform on AWS.
- **A team**: Team seats if usage is fairly even; mix Standard and Premium seats by measured usage instead of giving everyone Premium. On Enterprise you pay API rates for usage anyway, so cost per developer behaves like API spend.
- **Spend that must sit in your cloud account**: Bedrock, Agent Platform or Foundry, accepting the features that need a claude.ai login.

Plans change quickly. Since the first edition, Anthropic has made auto mode's classifier overhead free on Pro, Max and Team, ended a weekly-limit promotion on 13 September, and changed Claude Code's weekly limits from 14 September 2026; [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) has the numbers and how to read them. Re-run the protocol whenever the plan or your default model changes.

## What moves the number

**Caching.** Most of each request is a repeated prefix: system prompt, tool definitions, CLAUDE.md, the conversation so far. A cache hit costs 10% of the input price on most models, 5% on Opus 5.5 and 2.5% on Fable 5.1. For example, with a 150,000-token prefix on Opus 5.5 at list prices:

- Re-sent uncached on every turn: 0.15 × $4 = $0.60 per turn.
- Read from cache: 0.15 × $0.20 = $0.03 per turn, after one write of $0.75 (five-minute cache) or $1.20 (one-hour cache).

Over 40 turns with a warm cache, that is about $2 instead of $24. The cache pays off after one read for the five-minute cache and two reads for the one-hour cache. On a subscription, within the plan's included usage, Claude Code requests the one-hour cache for the main conversation by default; with an API key or a cloud provider it uses five minutes unless you set `promptCacheTtl` to `1h`. Anything that rewrites the prefix mid-session, such as switching models or adding an MCP server, throws the cache away.

**Model and effort.** Fable 5.1 output costs five times Sonnet 5.5's. Match the model to the job and set cheaper models on simple subagents. `maxEffortLevel` in managed settings caps effort across a fleet.

**Parallelism.** Each subagent, background session or teammate has its own context and its own cache. Five agents cost roughly five times one, so check that the parallel work actually ships (cost per merged change, above).

**Session length.** Long sessions carry long prefixes. Clearing between unrelated tasks and compacting before the context gets large keep each turn cheap.

## Hard budget caps

Simon Willison argued on 3 October 2026 that services agents touch need "default hard budget caps": "after $X/month, cut this thing off and return errors", not a warning email that arrives after the money is gone. Apply that to your own agents. Here is where a hard cap exists today:

| Layer | Cap | What happens at the cap |
|---|---|---|
| One headless run | `claude -p --max-budget-usd 5` | Stops; subagent spend counts, and new subagents fail with `Budget limit reached` |
| A Managed Agents session | `budget.max_list_cost`, in cents | Session pauses with `budget_reached` until you raise or remove it |
| Pro or Max usage credits | Monthly spend limit in Settings > Usage | Credit spend stops until you raise the limit; plan windows are hard limits anyway |
| Team or Enterprise | Spend limits per organization, group or member in Admin settings > Usage | Members see a spend-limit message |
| Console workspace | Monthly workspace spend limit and rate limit; the Claude Code workspace also takes per-user monthly limits | Spend in that workspace is capped for the month |
| Code Review | Monthly cap for the Claude Code Review service | Reviews stop |
| Claude apps gateway | Per-developer daily, weekly or monthly caps | Gateway returns `429` until reset |
| Cloud provider | Your cloud's budget controls | Varies; many are alerts, not cutoffs |

Two cautions. A Managed Agents budget is measured at list price and enforced between requests, so a negotiated discount or an in-flight request means the real figure differs slightly from the cap. And cloud budget alerts are mostly soft. Willison notes that AWS began rolling out project spend limits that pause a project in September 2026, initially to a limited set of customers, and that Google Cloud launched Spend Caps in July. Confirm which kind you have before an agent can deploy into that account.

### Check that it worked

Run a deliberately tiny budget:

```bash
claude -p "Summarize every file in this repository" \
  --max-budget-usd 0.05 --output-format json | jq '{subtype, total_cost_usd}'
```

The run should end early, with a `subtype` of `error_max_budget_usd` and a `total_cost_usd` at or slightly above the cap. On a Team or Enterprise plan, also check that `/usage` shows your usage-credits row against the limit your admin set.

## Sources

- "Pricing", Claude, Anthropic, accessed 2026-10-04. https://claude.com/pricing
- "Pricing", Claude Platform docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/about-claude/pricing
- "Manage costs effectively", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/costs
- "How Claude Code uses prompt caching", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- "Monitoring", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/monitoring-usage
- "CLI reference" (`--max-budget-usd`), Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/cli-reference
- "The agent loop" (result subtypes), Agent SDK docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agent-sdk/agent-loop
- "Claude apps gateway spend limits", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/claude-apps-gateway-spend-limits
- "Session budgets", Claude Platform docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/managed-agents/budgets
- "Auto mode is now the default in Claude Code for Pro, Max, and Team plans", Claude blog, Anthropic, 2026-08-07. https://claude.com/blog/auto-mode-default-in-claude-code
- "We're going to need default hard budget caps on pretty much everything", Simon Willison, 2026-10-03. https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/
- ccusage 20.0.26, `npx ccusage claude weekly --help`, run 2026-10-04. https://github.com/ccusage/ccusage
