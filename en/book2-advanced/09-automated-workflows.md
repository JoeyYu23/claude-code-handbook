# Chapter 9: Automated Workflows

Claude Code is not only an interactive tool. It is a programmable component that you can embed in CI/CD pipelines, scheduled jobs, GitHub Actions, and custom automation scripts. This chapter covers everything you need to run Claude Code headlessly and build automated workflows.

---

## The `--print` Flag: Headless Mode

The `--print` flag (shorthand `-p`) is the foundation of all automation. It takes a query, runs Claude Code non-interactively, prints the response, and exits.

```bash
claude -p "What does this codebase do?"
```

```bash
# Process piped content
cat app.log | claude -p "Summarize errors and categorize by severity"
```

```bash
# Use in scripts
RESULT=$(claude -p "List all TODO comments in the codebase")
echo "$RESULT" > todo-report.txt
```

In `--print` mode, Claude cannot ask you questions or request permissions interactively. You must either pre-approve the necessary tools with `--allowedTools`, or use `--dangerously-skip-permissions` for trusted automation environments.

---

## CLI Flags for Automation

These flags are especially relevant for automated use:

**`--max-turns N`** — Limits the number of agentic turns. Prevents runaway execution in scripts:

```bash
claude -p "Analyze security vulnerabilities" --max-turns 10
```

**`--max-budget-usd N`** — Hard cap on API cost. The task fails if this budget is exceeded:

```bash
claude -p "Refactor the entire codebase" --max-budget-usd 2.50
```

**`--output-format [text|json|stream-json]`** — Controls the output format:

```bash
# JSON output for programmatic parsing
claude -p "List all functions in auth.py" --output-format json

# Streaming JSON for real-time processing
claude -p "Run tests and report results" --output-format stream-json
```

**`--allowedTools`** — Pre-approves specific tools for non-interactive use:

```bash
claude -p "Run the test suite" --allowedTools "Bash(npm test)"
```

**`--no-session-persistence`** — Prevents the session from being saved to disk:

```bash
claude -p "Analyze this PR" --no-session-persistence
```

**`--append-system-prompt`** — Adds context to the system prompt without replacing it:

```bash
claude -p "Review this code" --append-system-prompt "You are reviewing for PCI-DSS compliance. Flag any credit card data handling."
```

**`--json-schema`** — Constrains the output to match a JSON Schema. The response is validated against the schema and retried if it does not conform:

```bash
claude -p "Extract all function names from this file" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

**`--bare`** — Minimal headless mode. Skips hooks, LSP integration, plugins, MCP servers, auto-memory, and `CLAUDE.md` loading. Fastest startup; use when you want pure model inference without any project configuration:

```bash
claude -p "What is the time complexity of binary search?" --bare
```

`--bare` is useful for quick queries, testing, and cases where you explicitly do not want project-specific configuration to influence the response.

---

## Output Formats

### Text Output (default)

Plain text response, suitable for human-readable reports or simple piping:

```bash
claude -p "Generate release notes since the last tag" > RELEASE_NOTES.md
```

### JSON Output

Structured JSON with metadata about the response:

```bash
claude -p "List all exported functions" --output-format json | jq '.result'
```

The JSON includes:
```json
{
  "result": "The response text",
  "session_id": "abc123",
  "total_cost_usd": 0.012,
  "usage": {
    "input_tokens": 4523,
    "output_tokens": 892
  }
}
```

### Stream JSON Output

For long-running tasks, stream the response as it is generated. Each line is a JSON event:

```bash
claude -p "Analyze all 50 modules" --output-format stream-json | while read line; do
  EVENT_TYPE=$(echo "$line" | jq -r '.type')
  if [ "$EVENT_TYPE" = "result" ]; then
    echo "$(echo "$line" | jq -r '.result')"
  fi
done
```

---

## GitHub Actions Integration

Claude Code's official GitHub Action (`anthropics/claude-code-action@v1`) integrates AI directly into your GitHub workflows.

### Setup

The fastest setup uses the built-in command:

```text
/install-github-app
```

This installs the Claude GitHub App, adds the required secrets, and creates the workflow file. For manual setup:

1. Install the [Claude GitHub App](https://github.com/apps/claude)
2. Add `ANTHROPIC_API_KEY` to your repository secrets
3. Create `.github/workflows/claude.yml`

### Responding to @claude Mentions

The most common use case: respond when someone mentions `@claude` in a PR or issue comment.

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

When a team member comments `@claude fix the failing tests`, Claude analyzes the PR, finds the failures, implements fixes, and pushes commits to the branch.

### Automatic PR Review

Run a review on every pull request without requiring a `@claude` trigger:

```yaml
name: Automated PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review this pull request for:
            1. Security vulnerabilities (Critical/High/Medium/Low)
            2. Logic errors or edge cases
            3. Missing tests for new code
            4. Performance concerns

            Post findings as a PR review comment. For each issue, include
            the file path, line number, description, and suggested fix.
          claude_args: "--max-turns 15"
```

### Scheduled Automation

Run Claude on a schedule for recurring maintenance tasks:

```yaml
name: Weekly Dependency Audit
on:
  schedule:
    - cron: "0 9 * * 1"  # Every Monday at 9 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Audit project dependencies:
            1. Run npm audit and report HIGH/CRITICAL vulnerabilities
            2. Check for packages more than 2 major versions behind
            3. Create a GitHub issue titled "Weekly Dependency Audit [date]" with findings
            4. If there are CRITICAL vulnerabilities, assign the issue to @maintainer-account
          claude_args: "--max-turns 10 --allowedTools Bash,Read,Write"
```

### Issue Triage Automation

Automatically categorize and label new issues:

```yaml
name: Issue Triage
on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Triage this new issue:
            1. Read the issue title and body
            2. Categorize as: bug, enhancement, question, documentation, or security
            3. Estimate complexity: trivial, small, medium, large
            4. Apply appropriate GitHub labels using the gh CLI
            5. If it is a security issue, add the "security" label and ping @security-team
            6. Post a friendly acknowledgment comment
          claude_args: "--allowedTools Bash(gh *)"
```

### Advanced: Using Skills in GitHub Actions

Skills can be invoked from GitHub Actions workflows:

```yaml
name: Pre-merge Quality Check
on:
  pull_request:
    types: [ready_for_review]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/security-review"
          claude_args: "--max-turns 20"
```

This invokes your project's `security-review` skill on the PR diff, using the same skill definition your team uses locally.

---

## Pipe-Based Automation

Claude Code follows Unix conventions. Pipe data in and out like any other tool:

```bash
# Analyze logs
tail -f production.log | claude -p "Alert me to anomalies. Format: [SEVERITY] timestamp: message"

# Review changed files
git diff main --name-only | claude -p "Review these changed files for security vulnerabilities"

# Translate strings
cat locales/en.json | claude -p "Translate all values to French, preserve keys, output valid JSON" > locales/fr.json

# Generate documentation
find src -name "*.ts" -not -name "*.test.ts" | xargs cat | claude -p "Generate API documentation in OpenAPI 3.0 YAML format"
```

---

## Scripted Multi-Step Workflows

For complex automation, chain multiple Claude invocations in a bash script:

```bash
#!/bin/bash
# release-prep.sh - Automated release preparation

set -e

VERSION=${1:-$(git describe --tags --abbrev=0 | sed 's/v//')}
NEXT_VERSION=$2

echo "Preparing release $VERSION -> $NEXT_VERSION"

# Step 1: Verify clean state
echo "Step 1: Verifying test suite..."
claude -p "Run the full test suite. If any tests fail, output 'FAIL:' followed by a summary. If all pass, output 'PASS'." \
  --allowedTools "Bash(npm test)" --max-turns 5 | grep -q "^PASS" || {
  echo "Tests failing. Aborting release prep."
  exit 1
}

# Step 2: Generate changelog
echo "Step 2: Generating changelog..."
CHANGELOG=$(claude -p "Generate a Keep a Changelog entry for version $VERSION based on git commits since the last tag. Output only the markdown, no explanation." \
  --allowedTools "Bash(git *)" --max-turns 3)

# Step 3: Update version files
echo "Step 3: Updating version..."
claude -p "Update the version to $NEXT_VERSION in package.json and any other version files you find." \
  --allowedTools "Read,Edit,Bash(find *)" --max-turns 5 --dangerously-skip-permissions

# Step 4: Prepend to CHANGELOG
echo "$CHANGELOG" | cat - CHANGELOG.md > /tmp/changelog.tmp && mv /tmp/changelog.tmp CHANGELOG.md

# Step 5: Create commit
git add -A
git commit -m "chore: release $VERSION"
git tag "v$VERSION"

echo "Release $VERSION prepared. Review the changes and run: git push && git push --tags"
```

---

## Continuous Integration Patterns

### Per-Commit Security Scan

```yaml
name: Security Scan
on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Need two commits for diff
      - name: Run security scan
        run: |
          RESULT=$(claude -p "Review the changes in this commit for security vulnerabilities. Output JSON with fields: vulnerabilities (array of {severity, file, line, description}), summary (string)." \
            --allowedTools "Bash(git diff HEAD~1)" --output-format text --max-turns 5)

          CRITICAL=$(echo "$RESULT" | python3 -c "import sys,json; data=json.load(sys.stdin) if sys.stdin.readable() else {}; print(sum(1 for v in data.get('vulnerabilities',[]) if v.get('severity')=='Critical'))" 2>/dev/null || echo "0")

          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::$CRITICAL critical security vulnerabilities found"
            echo "$RESULT"
            exit 1
          fi
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Documentation Freshness Check

```yaml
name: Documentation Check
on:
  pull_request:
    paths:
      - 'src/**'

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Check if the documentation needs updating for the changes in this PR:
            1. Run `git diff origin/main --name-only` to see changed files
            2. For each changed file, check if there is corresponding documentation
            3. If source code changed but documentation was not updated, list the gaps
            4. If everything looks up to date, say "Documentation is current."
            5. Post your findings as a PR comment
          claude_args: "--max-turns 10"
```

---

## Cost Management in Automation

Automated workflows can accumulate costs quickly. Key controls:

**Always set `--max-turns`** in automated contexts. Default is unlimited.

**Always set `--max-budget-usd`** for expensive tasks. The task fails cleanly when budget is exceeded rather than running indefinitely.

**Use Haiku for simple tasks.** Changelog generation, label application, and basic summaries do not need Opus or Sonnet:

```bash
claude -p "Apply the correct label to this issue" --model haiku --max-turns 3
```

**Scope tools tightly.** An agent that can only run `git` commands will not accidentally do expensive file-wide operations.

**Monitor costs.** The JSON output format includes `total_cost_usd` for each run. Log this in your CI system to track trends.

---

**Next up:** [Chapter 10 — Custom Tool Creation](./10-custom-tools.md) — Building MCP tools that Claude can use, defining tool schemas, and deploying tools for team use.
