# Performance Benchmarks

> Verified on 2026-10-04 with Claude Code 2.1.289.

The first edition of this appendix printed token ranges per task type with no source. They were estimates, and the models they described are gone, so they have been removed. What replaces them is a short guide to public benchmarks and two independent studies of the harness itself, with what each one measures and where it misleads.

The rule for reading any number here: a benchmark score tells you about that model, that harness, that benchmark and that run. It does not tell you how the model behaves on your codebase. Run a small evaluation of your own before changing models; see [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals).

## Vendor-reported model scores

On 2026-09-22 Anthropic published scores for Claude Opus 5.5 alongside Fable 5.1, Opus 5, GPT-6 Astra and GPT-5.6 Sol. These are the coding and agent rows from [that page](https://www.anthropic.com/claude-opus-5-5). The Claude figures are Anthropic's own measurements; its footnote says the GPT-6 Astra and GPT-5.6 Sol Terminal-Bench figures are as reported by OpenAI.

| Benchmark | What it measures | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | Agentic work in a terminal; the public leaderboard Anthropic's footnote cites uses the Claude Code harness | 66.4% (xhigh effort) | 55.8% | 52.3% | 57.9% (high effort) | 37.3% |
| FrontierCode v1.1 (Main) | Likelihood that agent-written code would be merged | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | Multi-file, ambiguous tasks drawn from real sessions | 57.8% | 51.8% | 46.6% | not listed | 41.7% |
| OSWorld 2.1 | Computer use (partial-credit scoring) | 81.8% | 80.7% | 74.0% | not listed | not listed |

Caveats, most important first:

1. **Vendor-run.** The same company built the model and chose the benchmarks, effort settings and harness. Terminal-Bench 4.0 carries a standard error of about 2.6 points for Opus 5.5 and 1.6 to 2 for the other Claude models, so adjacent rows are not clearly different.
2. **Settings differ by row.** Unless noted, Opus 5.5's results use max effort; Terminal-Bench 4.0 is quoted at xhigh for Opus 5.5 and at high effort for GPT-6 Astra (each model's highest score, per the page). The same page reports that at its default (medium) effort Opus 5.5 scores 54.6% on FrontierCode and 52.5% on CursorBench, so a cell is not a like-for-like comparison unless the effort matches.
3. **Anthropic says so itself.** The page states that "benchmark margins have become a less reliable guide to real-world differences" and that, in its own use, the gap between Opus 5.5 and Fable 5.1 is narrower than the scores suggest.
4. **Footnotes matter.** The page attaches numbered footnotes to several rows; read them before quoting a number.

## Long-horizon code quality: SlopCodeBench

[SlopCodeBench](https://arxiv.org/html/2603.24755v1) (University of Wisconsin-Madison, March 2026) hands the model a task in checkpoints, revealing new requirements over time, so the agent must evolve its own code instead of solving a fully specified problem. It scores strict pass rate and also code-smell measures such as verbosity and complexity.

HumanLayer ran a subset (3 problems, 17 checkpoints) on Opus 4.8, Sonnet 5 and Opus 5 in July 2026 and reported 24% strict pass for Opus 5, against 17% for Opus 4.6 and 11% for GPT-5.4 in the original paper. In that run, all models got more verbose and complex over each challenge, and Opus 5 wrote about five times as many functions as Opus 4.8. Caveat, stated by the author: the subset is small ("4 of 17" checkpoints for Opus 5), so it cannot support firm ranking. Its value is the shape of the result: passing tests and keeping the code maintainable are different things. This is the case for the checks in [Check the Work](/en/book1-getting-started/12-check-the-work).

## What the harness adds: two 2026 studies

Benchmarks usually vary the model. These two vary the harness, which matters if you own one ([Harness Engineering](/en/book3-architect/01-harness-engineering)).

### HarnessTax (UC Berkeley, September 2026)

By Melissa Z. Pan, Shuo Yang, Negar Arabzadeh, Wei-Lin Chiang, Ion Stoica and Matei Zaharia, at https://harnesstax.github.io/. Design: 21 model-harness pairs (seven models, three harnesses: Claude Code, Codex CLI and Pi), 30 randomly sampled tasks from each of SWE-bench Lite and Terminal-Bench 2.0, three runs per task, high effort, 100-turn cap, costs computed from one fixed direct-API price list dated 2026-09-01.

Findings, as the authors report them:

- Harness choice moved success rate little (within about 2 points on SWE-bench Lite and about 5 on Terminal-Bench 2.0 on average) but moved cost a lot. Claude Fable 5 solved 97.8% of attempts in Claude Code and 96.7% in Pi, at about $1.33 versus $0.67 per attempt.
- Across shared models, Claude Code cost about 2.0 times Pi and 1.6 times Codex on SWE-bench Lite, and 1.5 times Pi on Terminal-Bench 2.0 (geometric means).
- Pi, with four tools (read, write, edit, bash), sat on the cost-success frontier on both benchmarks. Claude Code's first model call carried over ten times the context of Pi's.
- For the six Anthropic and OpenAI models, a harness other than the model maker's had the top success rate in nine of twelve comparisons.

Caveats, partly the authors' own: only two open-source benchmarks, which models may have seen in training; small samples (30 tasks, so look at the confidence intervals the authors give); a mean cost depends on caching and later turns, not only the first call; and a richer harness may help on work these tasks do not test. Do not read it as "Claude Code is wasteful". Read it as "measure cost per solved task on your own work before accepting any default harness."

### An Empirical Study of Harness Design for Coding Agents (arXiv 2609.20804)

By Run-Ze Fan and eight co-authors, submitted 2026-09-17: https://arxiv.org/abs/2609.20804. A lightweight harness with a fixed execution loop, varying planning, action space and context management; four models, two benchmarks, 176 matched settings. Reported results: context management matters more as the budget shrinks, mostly by preventing overflow failures; rule-based elision before LLM summarization was the most efficient strategy tested; planning helps weaker models' accuracy but lowers cost for stronger ones without changing accuracy; and models with strong bash skills do better, cost-wise, with a bash-only interface. Caveat: it tests a lightweight research harness, not Claude Code itself, so treat it as evidence about design choices rather than about any product. HarnessTax is a different project from this paper; they are often cited together.

## How to use this appendix

- Quote a score only with its benchmark, its effort setting and who ran it.
- Compare cost per solved task, not just solve rate.
- Prefer a 20-task eval drawn from your own repository over any public leaderboard when the decision is yours.

### Check that it worked

Pick one model-and-harness change you are considering. Run the same ten to twenty real tasks before and after, recording success and the cost the CLI reports. If the difference is within the run-to-run spread of repeating the same configuration, you have not measured a difference.

## Sources

- Claude Opus 5.5, Anthropic, 2026-09-22: https://www.anthropic.com/claude-opus-5-5
- HarnessTax: How Much Does the Harness Matter for Coding Agents?, Pan et al., UC Berkeley, September 2026: https://harnesstax.github.io/
- An Empirical Study of Harness Design for Coding Agents, Fan et al., arXiv 2609.20804, 2026-09-17: https://arxiv.org/abs/2609.20804
- Benchmarking Opus 5 on SlopCodeBench, HumanLayer, July 2026: https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/benchmarking-opus-5-on-slop-code-bench.md
- SlopCodeBench paper, March 2026: https://arxiv.org/html/2603.24755v1
