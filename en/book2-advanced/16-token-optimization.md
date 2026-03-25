# Chapter 16: Token Optimization

## Why Token Costs Matter

Token costs are concrete and cumulative. A developer using Claude Code heavily on a paid subscription plan, or a team running Claude Code through the Anthropic API, can accumulate surprising costs if they do not develop habits that minimize unnecessary token consumption.

Beyond cost, token efficiency directly affects quality. A session that has consumed fewer tokens has more headroom for complex reasoning, more accurate context recall, and better performance on difficult tasks.

This chapter covers the mechanics of token costs, model selection strategy, patterns for reducing unnecessary consumption, and how to monitor and manage costs in practice.

---

## Understanding Token Costs: Input vs Output vs Thinking

Claude bills on three dimensions:

**Input tokens:** Everything Claude reads — your messages, file contents, conversation history, CLAUDE.md, MCP tool results, system prompts. Input tokens are generally cheaper than output tokens.

**Output tokens:** Everything Claude writes — responses, code, explanations, tool call parameters. Output tokens cost more per token than input tokens. Verbosity in Claude's responses directly increases cost.

**Extended thinking tokens:** When Claude uses extended thinking (deep reasoning before responding), those thinking tokens are billed separately. Extended thinking produces better results on complex reasoning tasks but at higher cost. For Claude Code, extended thinking is typically applied automatically for tasks that benefit from it. To disable it: `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`.

**Prompt cache read tokens:** Claude Code automatically caches frequently reused content (CLAUDE.md, system prompts). Cache reads cost approximately 10% of normal input token price. This happens transparently — you do not need to configure it.

The practical implication: sessions that involve lots of large file reads (high input) and generate a lot of code (high output) are the most expensive. Sessions focused on targeted, specific edits are the most cost-efficient.

---

## Model Selection: Opus vs Sonnet vs Haiku

Claude Code gives you access to multiple Claude models, each with different capability/cost tradeoffs:

**Claude Opus 4.6:** The most capable model. Best for:
- Complex architectural decisions requiring multi-step reasoning
- Debugging subtle, hard-to-find issues
- Tasks requiring synthesis across many files and concepts
- Research and analysis tasks
- Max/Team/Enterprise subscribers automatically get the 1M token context window version

**Claude Sonnet 4.6 (default):** The best balance of capability and cost. This is the right model for the majority of coding tasks:
- Feature implementation
- Bug fixing
- Code review
- Refactoring
- Writing tests
- Most day-to-day development work

**Claude Haiku 4.5:** Fastest and cheapest. Best for:
- Quick lookups and simple questions
- High-volume automated tasks (CI pipelines, batch processing)
- Tasks where speed matters more than depth
- Simple code transformations with clear specifications

You can specify model per session:

```bash
# Start a session with Opus for a complex architectural task
claude --model claude-opus-4-6

# Default (Sonnet) for regular development
claude

# Haiku for a batch automation script
claude --model claude-haiku-4-5 -p "Add type annotations to all functions in $(cat files.txt)"
```

Model aliases also work: `opus`, `sonnet`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan`.

**The highest-leverage model decision:** use Opus selectively for tasks that genuinely require it. The cost difference between Opus and Sonnet is significant (roughly 5x). A developer who reflexively uses Opus for everything pays five times more than one who uses Sonnet by default and switches to Opus only for genuinely complex reasoning tasks.

A practical rule: if you could explain the desired output in a clear prompt without requiring deep inference, Sonnet handles it well. If the task requires synthesizing ambiguous information from many sources, requires reasoning about trade-offs with many variables, or involves debugging a subtle multi-system interaction, reach for Opus.

---

## Reducing Unnecessary Context

The largest driver of token costs is context size. Every token Claude processes as input costs money and reduces available headroom. These habits reduce input costs significantly:

**Read files selectively, not wholesale.**

```text
# Expensive: reads entire file
Read the entire UserService.ts file

# Efficient: reads only what you need
In UserService.ts, show me only the getUserById and createUser methods
```

**Avoid re-reading files Claude has already read.**

Claude caches file contents within a session. If Claude has already read a file in this conversation, referencing it again does not require re-reading it. But asking Claude to `"re-read and summarize"` a file forces another full read.

**Prune CLAUDE.md ruthlessly.**

Every line of CLAUDE.md is loaded into every session. A 400-line CLAUDE.md consumes significant tokens on every conversation start, including every session where its contents are irrelevant.

Target: under 200 lines for your primary CLAUDE.md. Move project-specific details to `.claude/rules/` with path scoping so they only load when relevant.

**Use subagents to contain exploration costs.**

When Claude explores a large codebase, those file reads accumulate in your main context window. Subagents contain the exploration:

```text
Use a subagent to read through the entire orders module and produce
a one-paragraph summary of how order creation works.
```

The subagent reads many files, but only the summary returns to your main context.

**Use `/btw` for quick reference questions.**

```text
/btw what's the TypeScript Record type syntax again?
```

This appears in an overlay and never enters the main conversation history.

**Clear context between unrelated tasks.**

```text
/clear
```

Resetting context between genuinely unrelated tasks means you are not paying to keep irrelevant conversation history in context.

---

## Efficient Prompting Patterns

How you phrase requests affects output length and quality. Verbose, open-ended prompts tend to produce verbose responses. Focused prompts produce focused responses.

**Ask for specific outputs, not general exploration:**

```text
# Generates verbose exploratory response (expensive)
What do you think about this codebase's architecture?

# Generates focused response (efficient)
List the top 3 architectural concerns in src/api/handlers/,
each in one sentence.
```

**Request compact output formats when appropriate:**

```text
# Returns a structured table instead of paragraphs
List all API endpoints in this module as a table:
| Method | Path | Handler | Auth Required |
```

**Batch related questions:**

```text
# Three round trips (3x overhead)
What does getUserById do?
Then: Does it validate input?
Then: What errors can it throw?

# One round trip
For getUserById: what does it do, does it validate input, and what errors can it throw?
```

**Stop verbose output when you have enough:**

If Claude is explaining something and you have what you need:

```text
That's enough context — I understand the auth flow. Now, implement
the token refresh endpoint using this pattern.
```

Stopping Claude from completing a long explanation saves output tokens.

---

## Visualizing Context with /context

The `/context` command shows a visual breakdown of your current context window usage, with optimization suggestions:

```text
/context
```

This displays what is consuming the most tokens and suggests ways to reduce usage — which files are large, how much conversation history has accumulated, and whether compaction would help.

---

## Controlling Reasoning Effort

For tasks where you want to trade response quality for speed and cost, use the `/effort` command:

```text
/effort low      # Fastest, cheapest — simple lookups
/effort medium   # Balanced (default)
/effort high     # More thorough reasoning
/effort max      # Maximum effort — Opus only, not persistent
```

`/effort max` activates the highest reasoning depth and is only available with Claude Opus 4.6. It is not persistent across sessions — it applies to the current task only.

---

## Monitoring Costs with /cost

Track token usage in any session:

```text
/cost
```

This displays token counts and approximate cost for the current session, broken down by input, output, and cache read tokens.

For API users managing a team or automation budget:

```bash
# Check usage after a session
claude --output-format json -p "..." | jq '.usage'
```

The JSON output format includes token counts you can log, aggregate, and alert on.

For team-level monitoring, Claude Code exposes OpenTelemetry metrics that can be fed into your existing observability stack (Datadog, Grafana, etc.) to track per-user and per-project token consumption.

---

## Budget Management Strategies

**Set model defaults per project type.**

In CLAUDE.md, specify the model appropriate for the project:

```markdown
# Model Preference
Default to claude-sonnet-4-6 for all tasks.
Only use claude-opus-4-6 when explicitly asked to reason about architecture or
when debugging a persistent issue that requires deep analysis.
```

**Use non-interactive mode for automation.**

Non-interactive batch jobs using `claude -p` with Haiku can replace interactive sessions for high-volume tasks:

```bash
# Batch linting and fix suggestions — use Haiku for cost efficiency
for file in $(git diff --name-only HEAD~1); do
  claude --model claude-haiku-4-5 -p "Check $file for obvious bugs and style issues. Return a one-line summary."
done
```

**Session discipline in teams.**

On team API plans, individual developer habits compound. Establish shared norms:
- Clear context between tasks (`/clear`)
- Use Sonnet for routine work
- Compact proactively at logical breakpoints
- Avoid re-reading large files unnecessarily

**Budget alerts.**

Anthropic Console allows setting spend alerts on API keys. For teams, set per-key monthly limits and alerts at 80% of budget so you have time to respond before hitting limits.

---

## Real Cost Data and Benchmarks

Token costs vary by model and change over time as Anthropic updates pricing. The following benchmarks give approximate relative costs for common Claude Code tasks (based on Sonnet pricing as the baseline):

| Task | Typical Token Use | Relative Cost |
|------|------------------|---------------|
| Explain a 200-line file | ~3,000 tokens | Low |
| Write a unit test for one function | ~2,000 tokens | Low |
| Implement a medium feature (3-5 files) | ~15,000-25,000 tokens | Medium |
| Debug a complex multi-file issue | ~20,000-40,000 tokens | Medium-High |
| Full PR review (large PR, 10+ files) | ~30,000-60,000 tokens | High |
| Architecture planning session | ~50,000-100,000 tokens | High |

The single most cost-effective habit: `use /clear between unrelated tasks`. Most unnecessary token spending comes from accumulating context that has no bearing on the current task.

The single most capability-effective habit: `compact proactively at logical breakpoints`. This extends the useful lifetime of a complex session without the quality degradation of hitting context limits.

---

**Next up:** [Chapter 17 — Memory Architecture](./17-memory-architecture.md) — Deep dive into Claude Code's memory system and how to use it effectively.
