# Agents Checking Agents

> Verified on 2026-10-04 with Claude Code 2.1.289.

When agents write most of the code, much of the review is also done by agents. That works better than you might expect and worse than it looks. A second agent catches real bugs. It also agrees with the first agent for the wrong reasons, misses the same things, and can argue a whole group into a confident mistake.

This chapter covers the patterns that make agent review useful (reviewer agents, adversarial verification, and debate), the failure modes that make it dangerous, where the human belongs, and how to keep the rules your agents follow from changing every time someone has an opinion.

## Why a second agent helps at all

Asking the same model "are you sure?" does not do much. Huang et al. ("Large Language Models Cannot Self-Correct Reasoning Yet", 2023) found that models struggle to correct their own reasoning without external feedback, and that performance sometimes gets worse after self-correction. A second look helps when it brings **new information**, and the checker needs at least one thing the worker did not have:

- **A tool result.** It ran the test, reproduced the bug, or read the file the worker skipped.
- **A different brief.** It reviews only for security, or only for performance, or it is told to disprove the claim instead of to finish the task.
- **A clean context.** It has not spent forty turns committing to one approach.
- **A different model.** Its training gives it different blind spots, though fewer than you would hope (see below).
- **A human.** Someone who knows what the business actually needs.

A checker with none of these is the worker asking itself again. Design every check around which of these it adds.

## Pattern 1: reviewer agents

A reviewer agent reads the change through one lens and reports findings. It should not be able to fix what it reviews, because a reviewer that can edit tends to quietly patch over the problem and report success.

A custom subagent is the simplest version. Put it in `.claude/agents/` and leave `Edit` and `Write` out of its tools:

```markdown
---
name: security-reviewer
description: Reviews a diff for security problems only. Use after changes to auth, input handling, or anything that touches secrets.
tools: Read, Grep, Glob, Bash
model: inherit
---

Review the current branch's diff against main for security problems only:
injection, missing auth checks, unsafe deserialization, secrets in code or logs.
Ignore style and naming.

For each finding give: file:line, what is wrong, how an attacker would use it,
and the evidence (a command you ran and its output, or the exact code path).
If you have no evidence, label the finding "suspected" instead of "confirmed".
Report "no findings" if there are none. Do not invent findings to seem useful.
```

Claude Code also ships reviewers you can use as they are:

- **`/code-review`** reviews your branch, a PR number, or a ref range as a background subagent and reports correctness bugs. Effort trades coverage for confidence: at `low` and `medium` it reports only the findings it is most sure of, and `high` through `max` widen coverage at the cost of more false positives. Add `--fix` to apply the findings and `--max-findings all` to lift the usual cap on how many it reports.
- **Code Review for GitHub** runs several agents on each pull request, each looking for a different class of issue. A verification step then checks candidates against actual code behavior to filter out false positives. Its check run always finishes with a neutral conclusion, so it never blocks a merge on its own. To gate merges on it, parse the severity counts from the check run in your own CI. A `REVIEW.md` at the repository root can raise the bar for evidence, for example by requiring a `file:line` citation for any claim about behavior. The docs put the average cost at $15 to $25 per review.
- **`/code-review ultra`** (research preview) runs a larger fleet of reviewers in a cloud sandbox, and the docs say every reported finding is independently reproduced and verified.

Several reviewers with different lenses catch more than one generalist. The agent-teams docs suggest this prompt for a parallel review:

```text
Spawn three teammates to review PR #142:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

## Pattern 2: adversarial verification

A reviewer *proposes* findings. Adversarial verification adds a second step: before a finding is accepted, a separate agent tries to **refute** it. A finding that survives an honest attempt to disprove it is worth a human's time, and one that doesn't is noise you never see.

The rules that make this work:

1. **The verifier's goal is to disprove.** Its default answer is "not confirmed". It must produce evidence to confirm: a failing test, a command and its output, or a reproduced crash.
2. **The verifier gets the claim, not the reasoning behind it.** Give it the file, the line, and what is supposedly wrong. If it reads the finder's argument first, it tends to anchor on that argument. This is a design recommendation, not a measured result. Test it on your own findings.
3. **"Could not check" is a third verdict.** If the verifier hits a rate limit or can't build the project, the finding is unverified, not refuted. Claude Code's bundled `/deep-research` workflow follows the same rule: claims its verifiers can't check are listed as unverified instead of counted as refuted.
4. **One verifier per finding.** Each verifier gets a small context and one job. Nested subagents fit this shape. The subagent docs give a reviewer that dispatches a verifier per finding as their example.

Here is a verifier you can pair with any reviewer:

```markdown
---
name: finding-verifier
description: Tries to refute one code-review finding. Use once per finding, before the finding is reported or fixed.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You receive one claim about this repository: a file, a line, and what is
supposedly wrong. Your job is to show the claim is false.

Return exactly one verdict:
- CONFIRMED: you reproduced the problem. Include the command you ran and its
  output, or the failing test you wrote and where.
- REFUTED: the claim is wrong. Cite the file:line that shows why.
- UNVERIFIED: you could neither reproduce nor refute it. Say what you tried.

Never return CONFIRMED on reasoning alone. Do not modify tracked files.
```

You have three places to run the find-then-refute loop:

- **In a session.** Ask Claude to run `/code-review`, then spawn `finding-verifier` once per finding and report only the confirmed ones.
- **In a dynamic workflow**, when the scale is large and you want the same process every time. The workflows docs list adversarial cross-review of findings as one of the reasons to use them, with prompts such as "find issues until the list stops growing". See [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents).
- **In a hook**, when you want the check to run every time and not depend on Claude remembering to do it. A `Stop` hook of `"type": "agent"` spawns a subagent that can run the test suite before Claude is allowed to stop. Agent hooks are marked experimental, so prefer command hooks for anything you can check with a script. In agent teams, a `TaskCompleted` hook that exits with code 2 refuses the completion and sends its feedback to the teammate. [Hooks](/en/book2-advanced/09-hooks) shows the configuration.

## Pattern 3: debate, and debate across models

In a debate, agents argue toward an answer instead of one agent checking another. The research is more mixed than its popularity suggests.

**Evidence that it helps:**

- Du et al. ("Improving Factuality and Reasoning in Language Models through Multiagent Debate", 2023) had several model instances propose answers and critique each other over multiple rounds, and reported better math reasoning and fewer hallucinations.
- Liang et al. ("Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate", 2023) named "Degeneration-of-Thought": once a model is confident in an answer, self-reflection rarely moves it. A structured debate with a judge helped on translation and arithmetic tasks.
- Khan et al. ("Debating with More Persuasive LLMs Leads to More Truthful Answers", 2024) found that a weaker judge, model or human, picked the right answer more often when it listened to two expert debaters (76% for non-expert models and 88% for humans). The idea goes back to Irving, Christiano and Amodei's "AI safety via debate" (2018).

**Evidence that it often doesn't:**

- Smit et al. ("Should we be going MAD?", 2023) found that multi-agent debate, as usually implemented, does not reliably outperform other prompting strategies such as self-consistency. Some variants become competitive only after tuning.
- Choi, Zhu and Li ("Debate or Vote", arXiv:2508.17536, 2025) found across seven benchmarks that majority voting alone accounts for most of the gains usually attributed to multi-agent debate.
- Wynn, Satija and Hadfield ("Talk Isn't Always Cheap", arXiv:2509.05396, 2025) found that debate can *reduce* accuracy over rounds. Models switched from correct to incorrect answers under peer pressure, favoring agreement over challenging flawed reasoning.

The practical reading: debate earns its cost when there is something to find, such as a hidden root cause or competing hypotheses that can each be tested. It is weak when agents only exchange opinions. The agent-teams docs use it for exactly that case:

```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

What makes this work is that each hypothesis can be checked against the running system. "Consensus" means the surviving theory explains the logs, not that five agents voted for it.

### Using a different model as the checker

A subagent's `model` field accepts an alias (`sonnet`, `opus`, `haiku`, `fable`), a full model ID, or `inherit`. One detail catches people out: if you give a family alias that matches your main session's family, the subagent runs on the main session's exact model. To get a genuinely different checker, choose a different family or a specific model ID, and confirm in `/tasks`, which names the model on each subagent's row. To bring in another vendor's model, expose it through an MCP server or call that vendor's command-line tool from a script.

Don't expect too much from model diversity. Kim et al. ("Correlated Errors in Large Language Models", 2025) studied more than 350 models. On one leaderboard dataset, when two models were both wrong, they gave the same wrong answer 60% of the time. Larger and more accurate models had more strongly correlated errors, even across providers and architectures. A different model lowers the chance of a shared blind spot but does not remove it.

## Failure modes

| Failure | What happens | Countermeasure |
|---|---|---|
| Shared blind spots | Worker and checker share training data and fail the same way | Check against the world, not another opinion: tests, reproductions, production logs |
| Agreement taken as proof | Two agents agree, so the finding is "confirmed" | Require evidence for every confirmed verdict. Agreement alone is not a verdict |
| Confident convergence | Debate rounds pull correct agents toward a persuasive wrong answer | Keep verifiers independent (no shared transcript), limit the number of rounds, and score against ground truth |
| Judge bias | LLM judges favor the first answer shown, longer answers, and their own outputs (Zheng et al., 2023; Panickssery et al., 2024) | Randomize order, cap length, and use a judge from a different family than the worker |
| Blind evaluator | The `/goal` evaluator and prompt-based hooks judge only what they are shown. They do not run commands | Make the worker print the evidence (test output) into the transcript, or use a check that runs the command itself |
| Rubber stamps | Steps that look like review but aren't. In agent teams, the lead approves teammates' plans automatically | Know which of your gates actually inspect something |
| Noise flood | Reviewers report dozens of style nits and real bugs get lost | Narrow lenses, severity levels, an evidence bar in `REVIEW.md`, lower effort for higher precision |
| Cost | Every verifier is another context window | Verify only findings above a severity threshold. Measure cost per confirmed bug |

## The human as final reviewer

Agent checks lower the error rate. They don't remove the need for someone who is accountable. The useful question is where a human adds the most value per minute.

Put people where mistakes are expensive or slow to show up:

- **Design, before work starts.** Addy Osmani argues that humans are needed up front for product intent, system design, and the quality bar, and again where maintainability trade-offs come up. That is where review has the most leverage (see [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents)).
- **Irreversible actions.** Merges to the main branch, production deploys, data migrations, and anything that touches money or permissions.
- **Changes to the rules themselves**, covered in the next section.

Then make human review cheap. A human should receive a short list of confirmed findings, each with severity and evidence, sorted by risk, and not a raw transcript. OpenAI's internal pipeline, as Gergely Orosz describes it, classifies changes by risk: high-risk ones can get stricter review, and areas of the codebase can opt in to an agent that auto-approves low-risk PRs. Addy Osmani's warning sets the limit: "Number of checks != quality", and every approach still routes its output to one person's attention. [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals) covers how to decide what a human must see, and [Team Workflows](/en/book3-architect/12-team-workflows) covers how a team divides that work.

## Change control: taking in opinions without chasing them

An agent system collects opinions all day: reviewer findings, messages from other sessions, a teammate's preference, a blog post, the agent's own "lesson learned" after a mistake. If each one becomes a rule in `CLAUDE.md`, the rules grow, start to contradict each other, and stop meaning anything. If none of them do, the system never improves. You need a path for outside input that is open but slow.

Claude Code already applies this principle in a few places:

- A message from another session can't approve a permission prompt, and the receiving Claude is told not to change permission settings, `CLAUDE.md`, or other configuration because another session asked.
- Text sent to a routine through its API trigger arrives wrapped and labeled as untrusted data, and the routine acts on it only if its own saved prompt says to.

In both cases, input can inform the system but can't rewrite its rules. Apply the same separation to your own setup with four parts.

**1. Proposals, not edits.** A suggested rule change goes into a proposal: what to change, who or what suggested it, and the problem it solves. An issue or a pull request against the rules file works well. Agents may write proposals. They do not merge them.

**2. Evidence.** A proposal needs one of the following: an incident the rule would have prevented, a failing eval it fixes, or a measured improvement. For skills and plugins, `claude plugin eval` runs a test suite with and without the plugin and reports the score difference. For `CLAUDE.md` rules, run a fixed set of tasks before and after the change, as described in [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals). "A well-known engineer says so" is a reason to test an idea, not a reason to adopt it.

**3. A review gate.** Rule files get an owner. On GitHub, a `CODEOWNERS` entry plus branch protection that requires code-owner review does the job:

```text
# .github/CODEOWNERS
/CLAUDE.md      @your-org/agent-owners
/.claude/       @your-org/agent-owners
/REVIEW.md      @your-org/agent-owners
```

**4. A log of rule changes.** Keep an append-only record of why each rule exists and when to check it again. The entries below are illustrative:

```markdown
| Date       | Change                                   | Source            | Evidence                        | Decision | Review by  |
|------------|------------------------------------------|-------------------|---------------------------------|----------|------------|
| 2026-09-12 | Require file:line for behavior claims    | Review noise      | 9 of 20 findings had no source  | Adopted  | 2026-12-12 |
| 2026-09-20 | "Always use library X for dates"         | Blog post         | None                            | Rejected | -          |
```

The "Review by" column matters. Rules should expire unless someone renews them. `/doctor prompt-audit` asks Claude to audit your `CLAUDE.md` files, skills, and other configuration for outdated or conflicting instructions, which makes it a good way to start each review.

Steve Yegge describes a fuller version of this from his 50-to-60-agent organization. Rules move through a lifecycle (proposing, evaluating, ratifying, enacting, enforcing, measuring, amending, retiring), and a rule tightens each time it is broken again: custom, then warning, then written law, then mechanical enforcement. In Claude Code terms, the last step is a [hook](/en/book2-advanced/09-hooks) or a permission rule. Once a rule matters enough that breaking it is unacceptable, stop asking the model to remember it and make the harness enforce it. [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns) covers which rules actually change behavior.

### Check that it worked

- Each change to `CLAUDE.md` or `.claude/` in `git log` traces to a pull request approved by a code owner and to a row in the log.
- A proposal with no evidence sits in "proposed" and does not change agent behavior.
- `/doctor prompt-audit` reports no conflicting instructions, or you have a log entry for each conflict it does report.

## Try it: refute before you accept

This exercise checks that your review pipeline catches a real bug and rejects a fake one.

1. Save the `finding-verifier` agent above as `.claude/agents/finding-verifier.md`. Set `model` to a family different from your main session.
2. On a scratch branch, plant one real bug that a test can expose, such as an off-by-one in a loop bound, and commit it.
3. Run `/code-review --max-findings all` on the branch.
4. Add one false finding of your own to the list, naming a real file and line that is actually correct.
5. Ask Claude: "For each finding, spawn finding-verifier with only the file, line, and claim, not your reasoning. Report a table of finding, verdict, and evidence. Fix only CONFIRMED findings."

### Check that it worked

- The planted bug comes back **CONFIRMED** with a command and its output, or with a failing test.
- Your fake finding comes back **REFUTED** with a `file:line` citation.
- No finding is CONFIRMED without evidence. If one is, tighten the verifier's prompt and run the exercise again before you rely on the pipeline.
- `/tasks` shows the verifier subagents running on the model you chose, not the main session's model.

## Sources

- "Create custom subagents" (model selection, nested subagents, example reviewer), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Code Review" (multi-agent review, verification step, `REVIEW.md`, local `/code-review`), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/code-review
- "Find bugs with ultrareview", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/ultrareview
- "Orchestrate teams of Claude Code sessions" (parallel review, competing hypotheses, plan approval), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-teams
- "Orchestrate subagents at scale with dynamic workflows", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/workflows
- "Automate actions with hooks" (prompt-based and agent-based hooks), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/hooks-guide
- "Keep Claude working toward a goal" (evaluator reads the transcript only), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/goal
- "Message your other Claude Code sessions" (how a session treats an incoming message), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/cross-session-messaging
- "Automate work with routines" (untrusted fire payload), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/routines
- "Commands" (`/doctor prompt-audit`), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Jie Huang et al., "Large Language Models Cannot Self-Correct Reasoning Yet", arXiv:2310.01798, 2023. https://arxiv.org/abs/2310.01798
- Yilun Du, Shuang Li, Antonio Torralba, Joshua B. Tenenbaum, Igor Mordatch, "Improving Factuality and Reasoning in Language Models through Multiagent Debate", arXiv:2305.14325, 2023. https://arxiv.org/abs/2305.14325
- Tian Liang et al., "Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate", arXiv:2305.19118, 2023. https://arxiv.org/abs/2305.19118
- Akbir Khan et al., "Debating with More Persuasive LLMs Leads to More Truthful Answers", arXiv:2402.06782, 2024. https://arxiv.org/abs/2402.06782
- Geoffrey Irving, Paul Christiano, Dario Amodei, "AI safety via debate", arXiv:1805.00899, 2018. https://arxiv.org/abs/1805.00899
- Andries Smit et al., "Should we be going MAD? A Look at Multi-Agent Debate Strategies for LLMs", arXiv:2311.17371, 2023. https://arxiv.org/abs/2311.17371
- Hyeong Kyu Choi, Xiaojin Zhu, Sharon Li, "Debate or Vote: Which Yields Better Decisions in Multi-Agent Large Language Models?", arXiv:2508.17536, 2025. https://arxiv.org/abs/2508.17536
- Andrea Wynn, Harsh Satija, Gillian Hadfield, "Talk Isn't Always Cheap: Understanding Failure Modes in Multi-Agent Debate", arXiv:2509.05396, 2025. https://arxiv.org/abs/2509.05396
- Elliot Kim, Avi Garg, Kenny Peng, Nikhil Garg, "Correlated Errors in Large Language Models", arXiv:2506.07962, ICML 2025. https://arxiv.org/abs/2506.07962
- Lianmin Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", arXiv:2306.05685, 2023. https://arxiv.org/abs/2306.05685
- Arjun Panickssery, Samuel R. Bowman, Shi Feng, "LLM Evaluators Recognize and Favor Their Own Generations", arXiv:2404.13076, 2024. https://arxiv.org/abs/2404.13076
- Steve Yegge, "Fences, not Sandboxes", 2026-08-24. https://yegge.ai/essays/fences-not-sandboxes/
- Gergely Orosz, "Inside OpenAI's agentic software factory", The Pragmatic Engineer, 2026-09-15. https://newsletter.pragmaticengineer.com/p/openai-software-factory
- Addy Osmani, "Human judgment doesn't leave the software factory. It relocates.", 2026-08-21. https://addyo.substack.com/p/human-judgment-doesnt-leave-the-software
