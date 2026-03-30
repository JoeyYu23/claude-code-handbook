# Appendix C: Performance Benchmarks

This appendix provides reference data for typical token usage, cost estimates, and performance characteristics across common Claude Code task types. All figures are approximate and represent typical ranges observed across real development workflows.

---

## Token Usage by Task Type

Token counts represent total tokens (input + output) for a complete task, including context accumulation. Actual usage varies significantly based on codebase size, CLAUDE.md length, and conversation history.

### Exploration and Understanding Tasks

| Task | Typical Token Range | Notes |
|------|-------------------|-------|
| Explain a single 100-200 line file | 3,000–6,000 | One file read + explanation |
| Understand a module (5-10 files) | 10,000–25,000 | Multiple file reads, cross-reference |
| Map a full subsystem (20+ files) | 30,000–80,000 | Deep exploration; use subagent to contain |
| Answer a question about a function | 1,500–4,000 | Targeted read |
| Explain unfamiliar codebase end-to-end | 50,000–150,000 | Very wide exploration; plan to compact |
| Git log analysis (last 50 commits) | 5,000–15,000 | Varies with commit message length |

### Code Writing Tasks

| Task | Typical Token Range | Notes |
|------|-------------------|-------|
| Write a unit test for one function | 2,000–5,000 | One read + generation |
| Implement a simple utility function | 1,500–4,000 | Usually no file reads needed |
| Implement a CRUD endpoint (standard pattern) | 5,000–15,000 | Reads schema + existing handlers |
| Implement a medium feature (3-5 files) | 15,000–35,000 | Multiple reads, multiple writes |
| Implement a complex feature (10+ files) | 40,000–100,000 | Consider subagents for parts |
| Write a complete test suite for a module | 10,000–30,000 | Module read + test generation |
| Migrate a file to a new API/library | 5,000–20,000 | Depends on file size and library complexity |

### Bug Fixing Tasks

| Task | Typical Token Range | Notes |
|------|-------------------|-------|
| Fix a simple bug (error message provided) | 3,000–8,000 | Targeted file reads |
| Debug a complex multi-file issue | 20,000–60,000 | Exploration-heavy; context fills fast |
| Trace a performance issue | 15,000–50,000 | Depends on profiling depth |
| Fix a failing test (cause not obvious) | 5,000–20,000 | Test file + relevant source files |
| Fix a security vulnerability | 10,000–30,000 | Security analysis + multiple files |

### Code Review and Analysis Tasks

| Task | Typical Token Range | Notes |
|------|-------------------|-------|
| Review a small PR (1-3 files) | 5,000–12,000 | Diff + file context |
| Review a medium PR (5-10 files) | 15,000–35,000 | Larger diff + cross-file analysis |
| Review a large PR (20+ files) | 40,000–100,000 | Consider subagent reviewer |
| Security audit of a module | 15,000–40,000 | All files in module + analysis |
| Performance audit | 10,000–30,000 | Code + query analysis |
| Dependency vulnerability scan | 5,000–15,000 | package.json + npm audit output |

### Automation and Scripting Tasks

| Task | Typical Token Range | Notes |
|------|-------------------|-------|
| Write a shell script | 2,000–6,000 | Usually no file reads |
| Create a CI/CD workflow file | 3,000–8,000 | Reads existing config if present |
| Set up a GitHub Actions workflow | 4,000–10,000 | |
| Batch rename/refactor (10 files) | 10,000–25,000 | Parallel approach more efficient |
| Add type annotations (single file) | 3,000–8,000 | Depends on file size |
| Documentation generation (module) | 5,000–15,000 | Module read + doc generation |

---

## Cost Estimates

The following estimates use approximate Anthropic API pricing as of early 2025. Subscription plan costs (Pro, Max) are flat-rate and not reflected here — these figures apply to API (pay-per-use) usage.

**Pricing tiers (approximate, subject to change):**

| Model | Input tokens (per 1M) | Output tokens (per 1M) | Cache read (per 1M) |
|-------|----------------------|------------------------|---------------------|
| Claude Haiku 4.5 | ~$1 | ~$5 | ~$0.10 |
| Claude Sonnet 4.6 | ~$3 | ~$15 | ~$0.30 |
| Claude Opus 4.6 | ~$5 | ~$25 | ~$0.50 |

Prompt caching is automatic — Claude Code caches CLAUDE.md, system prompts, and other stable content. Cache reads cost approximately 10% of normal input price, which substantially reduces costs in long sessions where the same context is reused.

**Typical task costs (Sonnet, approximate):**

| Task | Estimated Cost |
|------|---------------|
| Quick question / single function explain | $0.01–$0.05 |
| Write a unit test | $0.03–$0.10 |
| Implement a CRUD endpoint | $0.10–$0.30 |
| Implement a medium feature | $0.30–$0.80 |
| Debug a complex issue | $0.40–$1.50 |
| Full PR review (large PR) | $0.80–$2.50 |
| Architecture planning session | $1.00–$4.00 |

**Model selection impact:**
Running the same task on Opus 4.6 vs Sonnet 4.6 costs approximately 1.7x more per token. However, Opus sessions tend to use more tokens due to deeper reasoning, so the effective cost difference is often 2-3x in practice. For tasks where Sonnet produces satisfactory results, the cost difference over a month of heavy use is still meaningful.

---

## Speed Benchmarks

Latency is primarily determined by output length. Time-to-first-token is typically 1-3 seconds. Full response time depends on output length.

| Task | Typical Total Time (Sonnet) |
|------|--------------------------|
| Short explanation | 3–8 seconds |
| Write a function | 5–15 seconds |
| Write a test file | 10–30 seconds |
| Implement a medium feature | 30–120 seconds |
| Large refactor (10+ files) | 2–8 minutes |
| Complex debugging session | 5–20 minutes (interactive) |

**Parallel agent speedup:**

Running 3 parallel subagents for independent tasks provides roughly 2.5–3x speedup compared to sequential execution (accounting for orchestration overhead). For tasks that can be parallelized cleanly (such as reviewing 30 files), parallel execution reduces wall-clock time significantly.

---

## Context Window Reference

Claude models have different context window sizes. As of early 2026:

| Model | Context Window | Notes |
|-------|---------------|-------|
| Claude Haiku 4.5 | 200,000 tokens | Standard |
| Claude Sonnet 4.6 | 200,000 tokens | Standard |
| Claude Opus 4.6 | 200,000 tokens | Standard |
| Claude Opus 4.6 (1M) | 1,000,000 tokens | Max/Team/Enterprise automatically; disable with `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` |

200,000 tokens sounds large, but fills faster than expected:

| Content | Approximate Tokens |
|---------|-------------------|
| 1,000 lines of TypeScript | ~6,000 tokens |
| One CLAUDE.md file (200 lines) | ~1,500 tokens |
| A 100-message conversation | ~20,000–60,000 tokens |
| Full test suite output (200 tests) | ~15,000–30,000 tokens |
| A large PR diff (500 lines changed) | ~10,000–20,000 tokens |

**Practical limit for sustained quality:** Claude Code typically maintains high performance up to roughly 60-70% of context window capacity. Above that, quality degradation becomes perceptible. Above 90%, it becomes significant.

For a 200K window, this means:
- Comfortable working range: up to ~130,000 tokens
- Quality begins degrading: 130,000–180,000 tokens
- Compact or clear: above 180,000 tokens

---

## Benchmarks: Subagent vs. Sequential Processing

For tasks involving many files, using subagents provides meaningful performance advantages:

**Scenario: Review 10 files for security issues**

| Approach | Wall-Clock Time | Main Context Consumed | Quality |
|----------|----------------|----------------------|---------|
| Sequential (all in main context) | 3-5 min | ~30,000-50,000 tokens | Degrades on later files |
| One subagent per file (parallel) | 1-2 min | ~5,000 tokens (summaries) | Consistent across all files |

**Scenario: Implement a feature with extensive codebase exploration**

| Approach | Context After Implementation | Context Available for Iteration |
|----------|------------------------------|--------------------------------|
| Explore everything in main context | 80,000-120,000 tokens | Limited |
| Use subagent for exploration, summary back | 20,000-30,000 tokens | Substantial |

The efficiency gain from delegating exploration to subagents is most pronounced on large codebases with many related files.

---

## Tips for Reducing Token Consumption

The following habits reduce token usage by 30-60% in typical workflows:

1. **Be specific about files to read.** "Read src/auth/session.ts, specifically the `refreshToken` function" vs. "Read the auth module."

2. **Use `/clear` between unrelated tasks.** Removing 30,000 tokens of irrelevant conversation before starting a new task saves real money on API plans.

3. **Compact proactively.** Compacting at 50% context fill produces better summaries than waiting until 90%.

4. **Use subagents for exploration.** A subagent that reads 20 files costs the same total tokens but keeps 80% of those tokens out of your main context.

5. **Keep CLAUDE.md concise.** Every line of CLAUDE.md costs tokens on every session start. A 400-line CLAUDE.md might cost 3,000 tokens per session — at 100 sessions per month, that is 300,000 tokens of pure overhead.

6. **Avoid re-reading unchanged files.** If Claude already read a file in this session, reference the information rather than asking Claude to re-read it.

7. **Use `/btw` for quick lookups.** Quick reference questions answered in the `/btw` overlay consume zero main context tokens.
