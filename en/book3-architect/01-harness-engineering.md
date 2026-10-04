# Harness Engineering

> Verified on 2026-10-04 with Claude Code 2.1.289.

A coding agent is a model plus a harness. Lilian Weng defines the harness as "the system surrounding a base model that orchestrates execution and decides how the model thinks and plans, calls tools and acts, perceives and manages context, stores artifacts, and evaluates results." In Claude Code, part of that system ships with the product: the system prompt, the tool definitions, compaction, the auto mode classifier. The rest you add yourself: CLAUDE.md files, rules, skills, subagents, hooks, MCP servers, plugins and permission settings.

The first edition of this chapter treated the harness as a design exercise: pick the layers, follow some principles, build it up. That advice still holds in part, but 2026 added something better than principles: measurements. Several independent studies have now compared harnesses with the model held fixed. This chapter covers what they found, how to measure your own harness the same way, how to audit it, and what you can own when the model is not yours.

## What the studies show

### HarnessTax: same model, different harness

In September 2026 a UC Berkeley and Arena team (Melissa Pan, Matei Zaharia and others) published HarnessTax. They ran 21 model and harness pairs: seven models across three harnesses, Claude Code, Codex CLI and Pi (a minimal open-source harness with four tools: read, write, edit and bash). Each pair ran the same 30 tasks from SWE-bench Lite and from Terminal-Bench 2.0, three times per task, at each harness's high effort setting, capped at 100 turns, priced with one fixed price list.

Their findings:

- **The harness barely moved success rates.** The average harness effect stayed within about ±2% on SWE-bench Lite and about ±5% on Terminal-Bench 2.0. Claude Fable 5 solved 97.8% of attempts in Claude Code, 96.7% in Codex and 96.7% in Pi.
- **The harness moved cost a lot.** Across shared models, Claude Code cost about 2.0 times as much as Pi and 1.6 times as much as Codex on SWE-bench Lite, and 1.5 times as much as Pi on Terminal-Bench 2.0. For Fable 5 on SWE-bench Lite, that was $1.33 against $0.67 per attempt, with almost the same number of turns.
- **The tax starts before the first turn.** Claude Code's mean initial context was more than ten times Pi's, with longer instructions and larger tool schemas.
- **A model's own harness was not always its best.** For the six Anthropic and OpenAI models, an alternative harness reached the highest observed success rate in nine of twelve comparisons.

The authors are clear about the limits: two public benchmarks that the models may have seen in training, 30 tasks each, short self-contained tasks. A separate measurement by Systima in July 2026 found the same shape on a much older Claude Code version (2.1.207): about 33,000 tokens sent before the user's prompt, roughly 24,000 of them tool schemas. Book 1's [How It Works](/en/book1-getting-started/03-how-it-works) covers that debate.

### The arXiv harness study: which components matter

Also in September 2026, Run-Ze Fan and colleagues published "An Empirical Study of Harness Design for Coding Agents" (arXiv 2609.20804). They held the agent loop fixed and varied three components (planning, action space and context management) across 176 configurations, four open models (three Nemotron-3 sizes and Mistral-Medium-3.5-128B), SWE-Bench Verified and Terminal-Bench 2.1.

- **Context management matters most when the window is tight.** The gap between managed and unmanaged context fell from 35.7 percentage points at a 32k window to 2.7 points at 128k on SWE-Bench.
- **Cheap tricks first.** Rule-based elision of old content before LLM summarization gave the best efficiency.
- **Planning changes role with model strength.** Planning added 11.6 points of success for the weakest model, but for the two strongest it mostly cut cost, by about 30%.
- **Fewer tools can be better.** With a bash-only interface, the largest Nemotron model gained 3.6% on SWE-Bench while cost fell 53%.
- **Unused features are dead weight.** A recall store the agent could query had a median invocation rate of zero.

These are open models, not Claude, so treat the numbers as direction, not as a forecast for your setup. A third paper, "The Scaffold Effect in Coding Agents" (Vats and Golev, arXiv 2607.22585), reports the same pattern: pass rates within 0 to 8 points across harnesses, but up to 40 times more tokens per solved task.

### Lilian Weng's survey: the evaluator is the bottleneck

Weng's July 2026 post "Harness Engineering for Self-Improvement" surveys work where the harness itself is optimized, by search or by the model editing its own harness. Its list of open problems starts with weak evaluators and includes reward hacking. The lesson for practitioners: you can only improve a harness as fast as you can tell whether a change helped. That is why the next chapter, [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals), sits right after this one.

### What to take from the studies

- On well-specified tasks, the model decides most of the success and the harness decides most of the cost.
- Always-loaded context is paid on every request. Every line you add to the harness has to earn that.
- The benchmarks do not measure what many teams use Claude Code's harness for: the permission system and auto mode, hooks, subagents, long sessions with compaction, the desktop and IDE surfaces. Those may be worth their cost to you. The only way to know is to measure on your own work.

## Two layers: the harness you get and the harness you add

| Layer | What is in it | How to see it | How much you control it |
| :- | :- | :- | :- |
| Shipped | System prompt, built-in tools, compaction, auto mode classifier, bundled skills | `/context`; `claude --help` for flags | Partly: `--append-system-prompt`, `--system-prompt`, `--tools`, `--bare`, settings |
| Instructions | `CLAUDE.md`, `AGENTS.md`, `.claude/rules/`, auto memory | `/context` (Memory files), `/memory` | Fully |
| Capabilities | Skills, subagents, MCP servers, plugins, workflows | `/context`, `/skill-doctor`, `claude plugin details <name>` | Fully |
| Enforcement | Hooks, permission rules, sandbox, managed settings | `/hooks`, `/permissions` | Fully, except what an admin manages |

Two facts from the docs shape how you use these layers. First, Claude treats CLAUDE.md files "as context, not enforced configuration": the file arrives as a user message after the system prompt, and Claude tries to follow it with no guarantee. Second, hooks and permission rules are enforced by the client whatever Claude decides. So the first edition's rule of thumb still stands: instructions for taste, hooks for quality, settings for safety. What changed is that each layer now has a measurable price.

## Measure your harness

Measure three things: what loads before you type, what a task costs with and without a given layer, and what actually gets used over time.

### 1. The baseline: what loads before you type

Open a fresh session in your repository and run:

```text
/context
```

It shows the context window as a colored grid, lists the loaded memory files, and suggests savings. Add `all` to expand the per-item breakdown. Write down the total at session start.
<!-- AUTHOR-DATA: author's own /context total at session start in a real repository, and the same figure under --safe-mode -->

Then quit and start the same repository with your customizations switched off:

```bash
claude --safe-mode
```

Safe mode starts with CLAUDE.md, skills, installed plugins, hooks, MCP servers, custom commands, agents and more disabled; admin-managed settings still apply. Run `/context` again. The difference between the two totals is the always-loaded cost of the layers you added.

For plugins and skills, two more views help:

```bash
claude plugin details <plugin-name>   # component inventory and projected token cost
```

```text
/skill-doctor
```

`/skill-doctor` shows what each skill costs in context and how often it is used, and flags skills that have never been invoked. It needs version 2.1.252 or later.

### 2. Per-task cost and outcome, with and without a layer

A baseline number tells you what a layer costs, not what it buys. For that, run the same task with and without the layer and compare cost and result. Non-interactive runs report an estimated cost: with `--output-format json`, the result includes `total_cost_usd`.

This script runs one task several times in two arms, with and without the repository's instruction files, each run in a fresh detached worktree. It prints a CSV of cost and whether your check command passed afterwards.

```bash
#!/usr/bin/env bash
# ab-run.sh <task-file> "<check command>" [runs]
# Example: ./ab-run.sh tasks/fix-date-parsing.md "npm test" 3
set -euo pipefail
prompt=$(cat "$1"); check=$2; runs=${3:-3}
repo=$(git rev-parse --show-toplevel)
echo "arm,run,cost_usd,check_passed"
for arm in with without; do
  for i in $(seq 1 "$runs"); do
    dir="$(mktemp -d)/wt"
    git -C "$repo" worktree add -q --detach "$dir" HEAD
    if [ "$arm" = without ]; then
      rm -rf "$dir/CLAUDE.md" "$dir/.claude/CLAUDE.md" "$dir/AGENTS.md" "$dir/.claude/rules"
    fi
    cost=$(cd "$dir" && claude -p "$prompt" --output-format json \
             --permission-mode auto --permission-prompts none | jq -r '.total_cost_usd')
    if (cd "$dir" && eval "$check" >/dev/null 2>&1); then ok=1; else ok=0; fi
    echo "$arm,$i,$cost,$ok"
    git -C "$repo" worktree remove --force "$dir"
  done
done
```

Notes on reading the result:

- Your user-level files (`~/.claude/CLAUDE.md`, user skills and hooks) load in both arms, so they cancel out. To test them, change what the script deletes.
- Three runs per arm is a smoke test, not a study. Agents are non-deterministic; HarnessTax used three runs per task across 30 tasks. Use several tasks that look like your real work.
- The cost figure is a client-side estimate and can differ from your bill. Compare arms against each other, not against an invoice.
- `--permission-mode auto --permission-prompts none` lets the run proceed unattended and denies anything that would have needed a person. Run this on a branch you can throw away.

For plugins you do not need the script. `claude plugin eval` runs a plugin's eval cases with the plugin and again with no plugin loaded, and reports both scores and the difference. The [next chapter](/en/book3-architect/02-verification-and-evals) shows how to write those cases.

### 3. What gets used over time

Snapshots miss drift. Two built-in sources cover the longer view:

- **`/insights`** generates an HTML report on your recent sessions on this machine: which projects you work in, how you use Claude Code, where things go wrong, and features to try.
- **OpenTelemetry** export gives a team the same picture. Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` plus the standard `OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER` and `OTEL_EXPORTER_OTLP_ENDPOINT` variables. Useful signals for harness work include the `claude_code.token.usage` and `claude_code.cost.usage` metrics and the `claude_code.skill_activated`, `claude_code.tool_result` and `claude_code.hook_registered` events. A skill that never appears in `skill_activated` across a team for a month is a removal candidate.

[Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) builds a full spend-tracking method on the same sources.

### Check that it worked

You are done measuring when you have three numbers written down: the `/context` total in a normal session, the same total under `claude --safe-mode`, and a CSV from at least one with-and-without run on a real task. If the two arms pass the check equally often, the layer you removed costs tokens without buying outcomes on that task. Try more tasks before deleting it, but put it on the list.

## Audit your harness

Measurement tells you the price. An audit decides what to keep. Run one when the model changes, when Claude Code jumps several versions, and otherwise every few months.

1. **Instruction files.** Run `/doctor prompt-audit` (version 2.1.283 or later). It looks for instructions written for older models, references to files or commands that no longer exist, and files that contradict each other, then proposes edits without changing anything until you say so. [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns) covers this step in depth.
2. **Skills.** Run `/skill-doctor`. Turn off never-invoked skills, starting with the ones that cost the most context.
3. **Plugins and MCP servers.** Run `/doctor`. Among other checks, it finds unused skills, MCP servers and plugins compared with their context cost, and flags slow hooks. It reports first and asks before changing anything.
4. **Hooks.** Run `/hooks` and list every hook with its owner and its reason. A hook nobody can explain gets removed. A hook that blocks most of the time encodes a bad rule; fix the rule.
5. **Permissions.** Check that every action that must never happen is a deny rule or a hook, not a sentence in CLAUDE.md. [Containment and Security](/en/book3-architect/09-containment-and-security) covers the full list.
6. **Anything you share.** If other people install your skills or plugins, give them eval cases so a regression shows up as a number.

Three anti-patterns from the first edition still cause most harness problems:

- **Over-configuration.** Fifty hooks and thirty skills on a small project. Start minimal and add a layer only when the agent fails without it and a measurement shows the layer fixes the failure.
- **Conflicting layers.** CLAUDE.md says one thing, a rule file says another, a skill a third. When two instructions conflict, Claude may pick either one. If something is critical, enforce it in one place, with a hook or a permission rule.
- **Hooks that block too often.** The agent learns to work around them and you spend your time explaining exceptions.

### Check that it worked

After an audit, run `/context` in a fresh session and compare the total with your earlier baseline. Then re-run your with-and-without task. The audit worked if the baseline went down and the pass rate did not.

## Owning the harness when you do not own the model

You cannot own the model. You can rent it from Anthropic or another provider, and it will change under you. Earendil's August 2026 essay "What Is a Harness?" argues that the harness is the part users can own and adapt, and that open harnesses keep that freedom. HarnessTax adds evidence that model capability carries across harnesses.

For most teams, owning the harness does not mean writing one. It means owning three things that survive a change of harness or model:

- **Your configuration, in portable formats.** Instructions in a file every agent reads (see the AGENTS.md section of [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns)), procedures as skill files, integrations as CLIs or MCP servers rather than features tied to one product. [Portability](/en/book3-architect/11-portability) goes further.
- **Your measurements.** The baseline, the with-and-without runs and the eval suites above. Record `claude --version` and the model next to every result, and re-run when either changes. The plugin eval docs list this exact use: catching regressions "when you change the plugin or a new model is released."
- **Your verification gates.** Tests, Stop hooks and review steps that decide when work is done. They work the same whichever agent did the work.

With those three in place, the choice of harness becomes an engineering decision you can re-make with data. You might keep Claude Code because the permission system, hooks and subagents are worth the measured overhead on your work. You might run cheap batch tasks through a leaner harness. Either way, you decide from your own numbers, not from a benchmark or a habit.

## Key takeaways

- A coding agent is a model and a harness. Published studies found the harness changes cost far more than success on standard benchmarks.
- Claude Code's own harness is large by design. Everything you add on top is paid on every request, so each layer must earn its place.
- Measure three things: the `/context` baseline (with and without `--safe-mode`), per-task cost and pass rate with and without a layer, and real usage over time.
- Audit with `/doctor prompt-audit`, `/skill-doctor`, `/doctor` and `/hooks`. Delete before you add.
- Own what survives a model change: portable configuration, measurements and verification gates.

## Sources

- Melissa Z. Pan, Shuo Yang, Negar Arabzadeh, Wei-Lin Chiang, Ion Stoica, Matei Zaharia (UC Berkeley, Arena Intelligence), "HarnessTax: How Much Does the Harness Matter for Coding Agents?", September 2026. https://harnesstax.github.io/
- Run-Ze Fan et al., "An Empirical Study of Harness Design for Coding Agents", arXiv 2609.20804, submitted 2026-09-17. https://arxiv.org/abs/2609.20804
- Naman Vats, Oleg Golev, "The Scaffold Effect in Coding Agents: Harness Choice as a Hidden Variable in Coding-Agent Evaluation", arXiv 2607.22585, 2026. https://arxiv.org/abs/2607.22585
- Lilian Weng, "Harness Engineering for Self-Improvement", Lil'Log, 2026-07-04. https://lilianweng.github.io/posts/2026-07-04-harness/
- Earendil, "What Is a Harness?", 2026-08-20. https://earendil.com/posts/what-is-a-harness/
- Systima, "Claude Code Is Way More Token-Hungry Than OpenCode. We Measured Exactly How Much" (page title: "Claude Code Sends 4.7x More Tokens Than OpenCode Before Reading Your Prompt"), 2026-07-12. https://systima.ai/blog/claude-code-vs-opencode-token-overhead
- Anthropic, Claude Code docs: "How Claude remembers your project" (memory), "Commands", "Skills", "Run Claude Code programmatically" (headless), "Monitoring" (OpenTelemetry), "Test plugins with evals", accessed 2026-10-04. https://code.claude.com/docs/en/memory , https://code.claude.com/docs/en/commands , https://code.claude.com/docs/en/skills , https://code.claude.com/docs/en/headless , https://code.claude.com/docs/en/monitoring-usage , https://code.claude.com/docs/en/plugin-evals
- Claude Code 2.1.289 CLI help (`claude --help`, `claude plugin --help`), 2026-10-04.
