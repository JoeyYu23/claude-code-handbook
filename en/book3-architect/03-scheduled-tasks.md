# Chapter 3: Scheduled Tasks & Automation Loops

## The Automation Opportunity

Picture this: every morning at 9 AM, you want your team to be notified about outdated dependencies in critical repositories. Every Friday, you want an automated code review of pull requests. Every hour, you want to poll a deployment status and alert the team if anything goes wrong.

Without automation, these tasks require discipline — you have to remember to run them, and if you do not, they do not happen. With automation, they simply happen, consistently and reliably, while you focus on more important work.

That is what Claude Code's scheduling system offers: the ability to define work that runs automatically, on a schedule you set, without needing you at the keyboard to trigger it.

---

## Three Approaches to Scheduling

Claude Code offers three distinct ways to automate recurring work. Each is designed for different scenarios:

### Session-Scoped Scheduling with `/loop`

The fastest way to automate work inside an active Claude Code session. You set up a recurring prompt that fires in the background while your terminal stays open.

**Best for:** Quick polling during development, temporary checks, experimentation with automation patterns.

**Constraints:** Only runs while your Claude Code session is active. Expires after 3 days maximum. Limited to tasks that do not require persistent state.

**Minimum interval:** 1 minute (other options have 1 hour minimum).

### Desktop Scheduled Tasks

Configuration-based scheduling that runs directly on your machine. Tasks persist across machine restarts and do not require an active Claude Code session.

**Best for:** Production automation, workflows that need local file access, teams managing machines with standard schedules.

**Constraints:** Requires your machine to be on and configured with launchd (macOS) or equivalent system scheduler. No cloud redundancy.

### Cloud Scheduled Tasks

Durable tasks hosted on Anthropic infrastructure. They run reliably whether your machine is on or off.

**Best for:** Critical production workflows, tasks that must not be skipped, work that does not depend on local files.

**Constraints:** Fresh clone of your repository on each run (no persistent local state). Minimum 1 hour interval. Runs autonomously without permission prompts.

---

## Quick Polling with `/loop`

The `/loop` skill is the fastest path from "I want this to run repeatedly" to "it is running repeatedly."

### Basic Syntax

```
/loop 5m check if the deployment finished and tell me what happened
```

Claude Code parses your request, creates a cron job, and runs it in the background. The interval is optional — if you do not specify one, it defaults to every 10 minutes.

### Interval Syntax

You can specify the interval at the beginning, at the end, or leave it implicit:

```
/loop 30m check the build
```

```
/loop check the build every 2 hours
```

```
/loop check the build
```

Supported units:
- `s` for seconds (rounded up to nearest minute)
- `m` for minutes
- `h` for hours
- `d` for days

Most reasonable intervals work as specified. Claude Code confirms the chosen interval when the loop is created.

### Looping Commands

The scheduled prompt can invoke another skill. This is useful when you have already packaged a workflow:

```
/loop 20m /review-pr 1234
```

Each time the job fires, Claude Code runs `/review-pr 1234` exactly as if you had typed it.

### One-Time Reminders

For non-recurring reminders, describe what you want in natural language. Claude Code schedules a single-fire task:

```
remind me at 3pm to push the release branch
```

```
in 45 minutes, check whether the integration tests passed
```

Claude Code pins the fire time to a specific hour and minute using cron, and confirms when it will run.

### Managing Loops

List all scheduled tasks:

```
what scheduled tasks do I have?
```

Cancel a specific task:

```
cancel the deploy check job
```

Under the hood, Claude Code uses three tools:
- **CronCreate**: Schedule a new task with a 5-field cron expression.
- **CronList**: List all active scheduled tasks.
- **CronDelete**: Cancel a task by ID.

Each task gets an 8-character ID. A session can hold up to 50 tasks at once.

### How `/loop` Executes

The scheduler checks every second for due tasks and enqueues them at low priority. A scheduled prompt fires between your interactive turns — while you are typing, or while Claude Code is waiting for your next message — not while Claude Code is in the middle of a response.

If Claude Code is busy when a task comes due, the prompt waits until the current turn completes. All times are in your local timezone.

### Jitter and Expiry

To avoid thundering herds — every session hitting the API at exactly the same wall-clock moment — the scheduler adds small, deterministic offsets:

- Recurring tasks fire up to 10% of their period late, capped at 15 minutes. An hourly task might fire between `:00` and `:06`.
- One-shot reminders scheduled for the top or bottom of the hour fire up to 90 seconds early.

The offset is derived from the task ID, so the same task always gets the same offset.

**Important:** Recurring `/loop` tasks automatically expire 3 days after creation. The task fires one final time, then deletes itself. This prevents forgotten loops from running indefinitely. If you need longer-running automation, use Desktop or Cloud scheduled tasks.

---

## Desktop Scheduled Tasks

For automation that needs to run reliably without your session active, configure Desktop scheduled tasks through Claude Code's configuration files.

### Setting Up Desktop Tasks

Desktop scheduled tasks are stored as individual SKILL.md files under `~/.claude/scheduled-tasks/`. Each task gets its own directory with a `SKILL.md` file that uses standard YAML frontmatter:

```
~/.claude/scheduled-tasks/
  daily-dependency-check/
    SKILL.md
  weekly-pr-review/
    SKILL.md
```

Example task file (`~/.claude/scheduled-tasks/daily-dependency-check/SKILL.md`):

```yaml
---
name: daily-dependency-check
description: Check for outdated dependencies in all repos and report critical ones
schedule: "0 9 * * *"
---

Check all dependencies in the current project.
Identify any packages with newer major versions available.
Report critical security advisories.
```

The Claude Desktop App must remain open for desktop tasks to run. Tasks are discovered automatically from the `~/.claude/scheduled-tasks/` directory.

### Cron Expression Reference

Desktop (and Cloud) tasks use standard 5-field cron expressions:

```
minute hour day-of-month month day-of-week
```

Common examples:

| Expression | Meaning |
|---|---|
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour on the hour |
| `7 * * * *` | Every hour at 7 minutes past |
| `0 9 * * *` | Every day at 9am local time |
| `0 9 * * 1-5` | Weekdays at 9am |
| `30 14 15 3 *` | March 15 at 2:30 PM |

All fields support:
- Wildcards: `*` (any value)
- Single values: `5`
- Steps: `*/15` (every 15th value)
- Ranges: `1-5`
- Lists: `1,15,30`

Day-of-week uses `0` or `7` for Sunday through `6` for Saturday. Extended cron syntax (L, W, ?, name aliases like MON) is not supported.

### MCP Servers and Permissions

Desktop tasks inherit MCP servers configured in your `.claude/mcp.json` file.

Example task with connectors (`~/.claude/scheduled-tasks/pr-review/SKILL.md`):

```yaml
---
name: pr-review
description: Review open PRs and summarize blockers
schedule: "0 10 * * 1-5"
connectors:
  - github
---

Review all open PRs and summarize blockers.
For each PR waiting more than 24 hours, flag it as urgent.
```

Tasks run autonomously by default — they do not prompt for permission.

---

## Cloud Scheduled Tasks

For work that must run reliably in the cloud, without depending on your machine's state, create tasks via `claude.ai`.

### Creating Cloud Tasks

1. Log into claude.ai and navigate to **Scheduled Tasks**.
2. Click **Create Task**.
3. Enter a name and description.
4. Write your prompt (the work you want to run).
5. Set the schedule using cron expression.
6. Connect repositories and integrate services (GitHub, Slack, Linear).
7. Click **Create** — the task is now active.

Tasks begin running on their defined schedule immediately.

### Cloud Task Capabilities

Cloud tasks have different capabilities than Desktop or `/loop` tasks:

- **No local file access.** Each run gets a fresh clone of your repository. You cannot access files on your machine.
- **Connectors for integrations.** GitHub, Slack, Linear, and other services are available directly in the cloud environment.
- **Autonomous execution.** Tasks run without permission prompts. Claude Code has already reviewed and approved the automation.
- **Minimum 1 hour interval.** Cloud tasks cannot run more frequently than hourly (session-scoped `/loop` tasks can run every minute).

### Example: Daily Dependency Check

```
Prompt: Check all dependencies in package.json and dependencies.txt files.
Identify any packages that have newer major versions available.
Report critical security advisories from GitHub Security Advisories.
Post findings to #engineering-alerts Slack channel.

Schedule: 0 9 * * *
Connectors: github, slack
```

This task runs every day at 9 AM. It clones your repository fresh, checks dependencies, queries GitHub's security database, and posts to Slack — all automatically.

### Viewing Cloud Task Runs

Each task has a run history visible in `claude.ai`. You can see:

- Execution time and duration
- Full execution log (what Claude Code did)
- Output and results
- Any errors or alerts

If a task fails, you can view the exact failure reason and re-run it manually.

---

## Community Tools

The open-source ecosystem has contributed several scheduling tools that extend Claude Code's capabilities. These are worth exploring if the built-in options do not quite fit your needs.

### [claudecron](https://github.com/phildougherty/claudecron) (phildougherty/claudecron on GitHub)

A self-hosted cron-like scheduler for Claude Code. Useful if you want:

- Full control over scheduling infrastructure
- Running on a custom schedule not supported by native cron syntax
- Executing arbitrary webhooks after Claude Code completes

Basic workflow:
1. Deploy claudecron to your server or local machine.
2. Define schedules in YAML.
3. Claudecron invokes Claude Code at scheduled times and receives results.

### [claude-tasks](https://github.com/kylemclaren/claude-tasks) (kylemclaren/claude-tasks)

A task runner that wraps Claude Code and adds features like:

- Task dependency chains (run Task A, then Task B when A completes)
- Retry logic with exponential backoff
- Logging and observability
- Local state persistence across runs

### [claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler) (jshchnz/claude-code-scheduler)

Focused on Desktop and macOS launchd integration. Provides:

- GUI for creating and managing scheduled tasks
- Better error notifications
- Integration with macOS native scheduling

---

## Common Automation Patterns

Here are real-world patterns you can implement with Claude Code scheduling:

### Daily Code Review Digest

**Cloud task, daily at 9 AM:**

```
List all PRs opened in the last 24 hours across our core repositories.
For each PR, note the title, author, and status (awaiting review, approved, etc.).
Identify any PRs that have been waiting for review for more than 24 hours.
Post a summary to #code-review Slack channel with links.
```

This ensures the team never loses track of reviews and blockers stay visible.

### Dependency Update Checks

**Desktop task, weekly on Monday at 6 AM:**

```
Check dependencies.txt and package.json in ~/projects/production-api/.
Identify packages with newer minor or patch versions available.
List any with pending security advisories.
Create a GitHub issue titled "Dependency updates available" if there are
actionable updates, otherwise report completion.
```

Keeps you proactive about updates without needing manual checking.

### Deployment Status Polling

**Session `/loop` during rollout:**

```
/loop 5m check deployment status for rollout-2024-03-26 and alert if any pod is failing
```

During a critical deployment, this keeps you informed without constant manual checks.

### Documentation Freshness Check

**Cloud task, weekly on Friday at 5 PM:**

```
List all markdown files in the docs/ directory.
For each file, extract the "last updated" date from front matter.
Identify any docs that have not been updated in the last 90 days.
Create a GitHub discussion asking if they still accurate.
```

Ensures documentation stays current and trusted.

### PR Comment Automation

**Desktop task, every 30 minutes:**

```
List all open PRs in the last 30 minutes.
For each PR, check if it has a description.
If the description is empty or a one-liner, add a helpful comment:
"Consider adding a description of changes, motivation, and testing performed."
```

Gentle nudges toward better PR discipline without being heavy-handed.

### Build Failure Notifications

**Cloud task, every hour:**

```
Check the CI/CD pipeline status.
If any build is failing, identify which tests failed.
Post detailed findings to #engineering Slack and tag the commit author.
```

Gets information to the right people faster than email digests.

---

## Choosing Which Approach

| Use `/loop` when... | Use Desktop when... | Use Cloud when... |
|---|---|---|
| You are actively working and want quick polling | You need durable, persistent automation | You need cloud-scale reliability |
| Tasks are temporary (a few hours) | Machine is always on and configured | Work must run even if your machine is off |
| You want to test automation patterns | Tasks need local file access | Tasks should be autonomous, no approval prompts |
| Minimum 1 minute intervals needed | Full control over your machine environment | You want auditable, centralized task history |

A practical approach: start with `/loop` to validate an automation idea. Once you are confident it works, move it to Cloud (if it has no local dependencies) or Desktop (if it does).

---

## Cron Expression Quick Reference

Reference for the 5-field format: `minute hour day month day-of-week`

```
# Basic intervals
*/5 * * * *      Every 5 minutes
0 * * * *        Every hour
0 0 * * *        Daily at midnight
0 0 * * 0        Weekly (Sunday)
0 0 1 * *        Monthly (first day)

# Business hours
0 9-17 * * 1-5   Every hour, 9 AM to 5 PM, weekdays only
30 18 * * 1-5    Daily at 6:30 PM, weekdays

# Specific times
0 9 * * *        Every day at 9 AM
0 14 15 * *      Every 15th at 2 PM
30 2 * * 1       Every Monday at 2:30 AM
```

---

## Best Practices for Scheduled Automation

### 1. Start with a Clear Signal

Define what success looks like before automation. If the task is "check the build," what exactly are you checking for? "Build failed," "slow build," "unusual patterns"? Vague automation produces vague results.

### 2. Fail Gracefully

Scheduled tasks should not panic when they encounter an error. Instead:

```
List all active deployments.
If any deployment status is unavailable, report "service unreachable"
and continue with other checks.
Do not fail the whole task.
```

### 3. Include Context

When a task reports findings, include enough context that readers do not need to investigate further:

```
Not: "3 PRs waiting for review"
Better: "3 PRs waiting >24 hours:
- #1234 (api) - auth refactor, assigned to @alice
- #1235 (frontend) - dark mode, assigned to @bob
- #1236 (infra) - caching, assigned to @carol"
```

### 4. Avoid Thundering Herds

If you have multiple related tasks (checking deployment, checking logs, checking metrics), stagger them:

```
Deployment check: 0 9 * * *
Log analysis: 5 9 * * *
Metrics review: 10 9 * * *
```

Not all at exactly 9 AM.

### 5. Include a Disable Mechanism

For long-running automation, provide a way to pause without deleting the task:

```
"enabled": true   # Set to false to pause
```

This prevents accidental re-runs during maintenance windows.

### 6. Log Execution

Cloud and Desktop tasks should log what they did. Session `/loop` tasks are ephemeral, but if you rely on a task running correctly, you want evidence:

```
Started dependency check at 2024-03-26 09:00:15 UTC
Scanned 47 files in main branch
Found 3 outdated packages
Found 0 security advisories
Task completed successfully
```

### 7. Monitor Task Health

Cloud and Desktop tasks have run history. Periodically review:

- How many times did the task run?
- Did it ever fail?
- Is the schedule correct, or has it drifted?

---

## Environment Variables

You can control Claude Code's scheduling behavior with environment variables:

```bash
# Disable the scheduler entirely
CLAUDE_CODE_DISABLE_CRON=1

# Disable just cloud tasks
CLAUDE_CODE_DISABLE_CLOUD_TASKS=1

# Disable Desktop tasks
CLAUDE_CODE_DISABLE_DESKTOP_TASKS=1
```

---

## Limitations and Gotchas

### Session `/loop` limitations

- Tasks only fire while Claude Code is running and idle.
- No catch-up for missed fires. If you are on a long request and a scheduled task comes due, it fires once when you become idle, not multiple times.
- No persistence across restarts. Restarting Claude Code clears all `/loop` tasks.
- Maximum 3-day expiry.

### Cloud task limitations

- Fresh repository clone on each run (no persistent local state).
- Minimum 1 hour interval.
- Runs autonomously without permission prompts.
- Cannot access your machine's filesystem or environment.

### Desktop task limitations

- Requires your machine to be on and running launchd or equivalent.
- Does not sync across multiple machines (each machine runs its own tasks).
- Requires manual configuration in `.claude/` files.

---

## References

- [Claude Code Scheduled Tasks](https://code.claude.com/docs/en/scheduled-tasks)
- [claudecron](https://github.com/phildougherty/claudecron)
- [claude-tasks](https://github.com/kylemclaren/claude-tasks)
- [claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler)

---

**Next up:** [Chapter 4 — Cloud Providers & Remote Control](./04-cloud-remote.md)
