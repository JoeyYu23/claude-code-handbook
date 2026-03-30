# Chapter 19: Desktop App & Computer Use

## Why Desktop Changes Everything

Claude on the web is powerful for chat and focused coding. But the desktop app opens capabilities that fundamentally change how you work: three distinct interaction modes (Chat, Cowork, Code), visual diff review on your actual screen, live app previews, and — on macOS — direct computer control where Claude can see your screen, click buttons, and navigate applications autonomously.

This chapter covers each mode, when to use them, and the new possibilities that computer use enables.

---

## Three Modes: Chat, Cowork, Code

The Claude desktop app offers three distinct interaction modes, each optimized for different work patterns. They live in separate tabs within the same application.

### Chat: Conversational Baseline

Chat is the mode you know from the web version — conversational, immediate, no file system access by default. But desktop Chat gains two critical advantages:

1. **Screenshot context** — Press Option-Shift-C (macOS) to capture your screen and ask Claude about what you see. This is faster than explaining problems in words.
2. **Double-tap Option key** — Launch Claude's quick access overlay from any application without switching windows. Ask a question while staying focused on your code editor, browser, or design tool.

Chat is ideal for:
- Quick questions and debugging
- Exploring ideas before committing to code
- One-off analysis and explanations

### Cowork: Autonomous Knowledge Work

Cowork splits the difference between Chat and Code. You give Claude permission to read and edit files in folders you specify, and it runs autonomously across multiple steps to complete complex tasks. Unlike Chat, Cowork has persistent state — it remembers what it did, accumulates context, and can pick up where it left off across sessions.

Key capabilities:
- **File system access** — You grant access to specific folders. Claude reads, edits, and creates files with permission.
- **Multi-step autonomy** — Describe an outcome ("prepare a financial analysis for Q1") and Cowork breaks it into steps, executes them, and reports back.
- **Scheduled tasks** — Set recurring tasks to run on a schedule.
- **Computer use** (Pro/Max) — On macOS, you can grant Claude the ability to use your mouse, keyboard, and see your screen.

Cowork runs in a sandboxed, isolated environment. It cannot access the broader internet unless you explicitly connect it. This is safer than Code, which runs in a more open context.

Typical Cowork use cases:
- Research tasks that span multiple sources and documents
- Repetitive knowledge work (data entry, form filling, batch processing)
- Scheduled analyses and reports
- Anything where you describe the goal and Claude figures out the steps

### Code: Full Development Power

Code is Claude Code running in the desktop app. It has full read-write access to your codebase in a connected folder or GitHub repository. Unlike Cowork, Code assumes you are a developer and optimizes for building, testing, and shipping.

Key differentiators:
- **Bidirectional git integration** — Read and write commits, push branches, open PRs.
- **Visual diffs** — See changes rendered as a graphical diff on your screen (more on this below).
- **Test execution** — Run tests, debuggers, and build systems directly.
- **Three interaction styles** — Ask, Code, Plan modes let you control autonomy.

Code is for:
- Building features end-to-end
- Refactoring and migrations
- Debugging complex issues
- Anything that requires deep codebase knowledge and version control

---

## Installation & Setup

### Desktop App Installation

Download Claude from [claude.com](https://claude.com):

1. Download the appropriate version for your OS (macOS Intel/Apple Silicon, Windows).
2. Install and launch.
3. Sign in with your Claude account (create one if needed).
4. Choose your plan: Chat is free, Cowork and Code require Pro, Max, Team, or Enterprise.

### Connecting a Folder (Cowork & Code)

For Cowork and Code tabs, you must explicitly connect a folder:

1. Open the Cowork or Code tab.
2. Click "Connect Folder" (or similar button depending on your version).
3. Select a folder. Claude gains read-write access to that folder and its contents.
4. Optional: For Cowork, configure which subfolders Claude can access (restrictions are stored locally on your machine, not sent to Anthropic).

### Connecting a GitHub Repository (Code)

To work with a GitHub repository directly:

1. Open the Code tab.
2. Click "Connect Repository."
3. Enter the repository URL (GitHub link) or select a local repository.
4. Authenticate with GitHub using your personal access token or OAuth flow.
5. Claude can now read, write, and push commits to that repository.

### Computer Use (macOS)

If you are on Pro or Max and using macOS, you can grant Claude access to use your mouse, keyboard, and screenshot your screen:

1. Open Settings (gear icon).
2. Navigate to "Computer Use" or "Capabilities."
3. Toggle "Allow computer use" ON.
4. Grant screen recording permission (macOS will prompt you the first time Claude tries to take a screenshot).
5. After granting permission, Claude can see your screen and control your cursor.

This permission is local — it does not send your screen to Anthropic unless you explicitly ask Claude to take a screenshot in a message.

---

## Visual Diff Review

One of the most powerful desktop features is the visual diff viewer. When Claude Code makes changes, you see them rendered graphically before committing.

### Understanding the Diff View

When Claude edits a file, the diff view shows:
- **Left side:** Original code (red deletions).
- **Right side:** New code (green additions).
- **Line numbers:** Both original and new line numbers are visible.
- **Context:** A few lines of unchanged code above and below each change for orientation.

### Reviewing Changes

Open the diff view with `/diff` or by clicking the "Review Changes" button in the Cowork/Code interface.

You can:
1. **Accept the entire diff** — Click "Apply" to commit the changes.
2. **Reject the entire diff** — Click "Discard" to undo the changes without committing.
3. **Inspect specific changes** — Hover over sections to see context, jump to other files in the diff.
4. **Request refinements** — While the diff is open, tell Claude "Make the variable names clearer here" or "This function is too long, split it" and Claude will revise.

### Example: Reviewing a Feature

You ask Claude: "Add a dark mode toggle to the settings page."

Claude makes changes across `src/components/Settings.tsx`, `src/styles/theme.css`, and `src/utils/storage.ts`.

The diff view opens, showing:
- The new `DarkModeToggle` component with state management.
- CSS additions for dark mode styles.
- New local storage utility functions.

You review each change. You notice the dark mode class name is verbose. You say:
```
The CSS class names are too long. Rename "dark-mode-active" to "dm"
and "light-mode-active" to "lm" everywhere.
```

Claude revises all three files in real-time, and the diff view updates. Once satisfied, you click Apply.

---

## Live App Preview

For frontend projects (React, Vue, Next.js, etc.), Code can launch your app's development server and show you a live preview in the desktop interface.

### Starting a Preview

1. Open Code connected to a web project folder.
2. Ask: "Start the dev server and show me a preview."
3. Claude runs your build command (e.g., `npm run dev`), detects the server port, and opens a preview pane inside the Claude window.

### Interactive Preview

The preview is live and interactive:
- Click buttons, fill forms, navigate as you normally would.
- Changes Claude makes to your code auto-reload the preview.
- You can inspect the preview DOM, console logs, and network requests (developer tools integrated).

### Troubleshooting Preview Issues

If the preview fails to load:
- Claude will show the build/dev server output.
- Common issues: wrong port, failed dependencies, environment variables missing.
- You can tell Claude: "The server crashed. Check the build output and fix the error."

---

## Computer Use: Autonomous Mouse, Keyboard, Screenshot

> **Released:** March 24, 2026 (research preview). Available on macOS only, requires a Pro or Max subscription. To enable, open Settings, navigate to General, and toggle "Computer use" on. macOS will prompt you to grant Accessibility and Screen Recording permissions the first time. Your computer must be awake and the Claude Desktop app must be open for computer use to work.

Computer use is unique to Cowork and Code on macOS. When enabled, Claude can:
- **Take screenshots** of your screen to see the current state.
- **Move the mouse cursor** and click on elements.
- **Type text** using the keyboard.
- **Navigate applications** — open files, switch apps, fill forms, run scripts in terminal.

This is powerful but requires understanding what Claude can and cannot do safely.

### What Computer Use Can Do

**Automating repetitive UI interactions:**

You are managing a spreadsheet of customer data across a browser and a desktop app. Instead of manually copying and pasting entries, you tell Claude:

```
I have a list of customers in Spreadsheet A (browser) and need to
enter them into CRM System B (desktop app). Take a screenshot, then
automate the data entry: for each row in the spreadsheet, open a
new entry form in the CRM, fill in the fields, and save.
```

Claude takes a screenshot, sees both applications, and systematically transfers the data.

**Testing UI flows:**

You are building a checkout flow. Instead of manually testing every path:

```
Test the complete checkout flow:
1. Add an item to cart.
2. Proceed to checkout.
3. Fill in shipping address (use 123 Test St, Brooklyn, NY 11201).
4. Select "UPS Ground" as shipping method.
5. Enter test credit card (4111 1111 1111 1111).
6. Submit the order.

Take screenshots at each step to show me the flow.
```

Claude automates the entire flow, showing you what worked and what broke.

**File and app management:**

```
Find the file "report-2024.xlsx" in my Downloads folder,
open it in Excel, and sort the "Sales" sheet by revenue (descending).
```

### Safety Constraints on Computer Use

Claude cannot autonomously use computer use — you must explicitly ask. Even then, Claude operates under safety constraints:

1. **No sensitive data entry without confirmation** — Claude will ask before entering passwords, API keys, or credit card information.
2. **Timeout on long operations** — If an automated task takes too long without progress, Claude stops and asks for clarification.
3. **No automated purchases** — Claude will not submit orders or process payments without explicit per-action confirmation.
4. **Partial automation** — For risky operations, Claude may do 80% automatically and ask you to confirm the last 20%.

### Risks and Best Practices

**Risks:**

- **Unintended actions** — If Claude misidentifies a button or input field, it may click the wrong thing. Always review screenshots before automating critical flows.
- **State assumptions** — If your application's UI changes unexpectedly, Claude's automation can fail or take wrong actions. Monitor the first run carefully.
- **No rollback** — Some actions (deleting files, closing applications) cannot be easily undone. For destructive operations, use Computer Use to *preview* the action, not execute it immediately.

**Best practices:**

1. **Test on non-critical data first** — Before automating against your production database, test against a copy.
2. **Review screenshots** — Always check that Claude is looking at the right thing before confirming.
3. **Use Computer Use for repetitive, low-risk tasks** — Data entry, form filling, routine checks. Use it sparingly for risky operations.
4. **Combine with Code mode** — For complex automations, it is often safer to have Claude write a script (in Code) and then run the script (in Cowork/Computer Use), rather than rely entirely on UI automation.

### Example: Batch Data Entry with Review

```
I need to process a list of 50 customer signups from a CSV file.
For each row, open the admin dashboard, fill in the signup form,
and save. But take a screenshot before each save so I can review
before you proceed.
```

Claude will:
1. Read the CSV file.
2. Open the dashboard and fill in the first entry.
3. Take a screenshot showing the filled form.
4. Wait for your confirmation before clicking Save.
5. Repeat for each entry.

This hybrid approach gives you safety and automation.

---

## PR Monitoring & Dispatch

Code's integration with GitHub allows Claude to monitor pull requests and dispatch tasks based on PR state changes.

### Monitoring PRs

Ask Claude to monitor a specific PR:

```
Watch PR #142 (feature/dark-mode). When:
1. A new review comment appears, fetch it and summarize.
2. CI/CD checks fail, diagnose the failure and suggest a fix.
3. The PR is merged, post a completion summary to Slack.
```

Claude polls the PR periodically and takes actions when conditions are met.

### Dispatching Tasks from PR Reviews

If a reviewer requests changes:

```
Fetch any new PR comments on #142. For each comment requesting
changes, create a task in my Cowork session to fix the issue.
```

### GitHub Actions Integration

For Code connected to a repository with GitHub Actions:

```
Install the Claude GitHub App for this repository.
```

Claude can then:
- Trigger workflows manually.
- Read workflow logs and CI/CD output.
- Dispatch tasks based on CI/CD failures.
- Commit fixes directly when workflows suggest changes.

---

## Parallel Sessions with Worktrees

When you need Claude to work on multiple features in the same repository simultaneously without conflicts, use git worktrees.

### Creating a Worktree

In Code, spawn parallel agents with worktrees:

```
Create two agents:
1. Agent A in worktree feature-auth: Implement OAuth login.
2. Agent B in worktree feature-stripe: Implement Stripe integration.

Each works independently. Report when complete.
```

Each agent gets its own working directory pointing to the same repository. Changes in Agent A's worktree do not affect Agent B's working directory until explicitly merged.

### Worktree Configuration

For large repositories, configure which paths each worktree includes:

```json
{
  "worktree": {
    "sparsePaths": [
      "src/auth/",
      "tests/auth/",
      "docs/api/"
    ]
  }
}
```

This uses git sparse checkout, speeding up worktree creation for monorepos.

### Merging Worktrees

When both agents complete:

```
Merge the feature-auth worktree into main.
Then merge feature-stripe into main.
Resolve any conflicts and verify both features work together.
```

Worktrees significantly accelerate parallel development without manual conflict management.

---

## When to Use: Desktop vs. CLI vs. Web

Different interfaces excel at different tasks. Here is a decision tree:

### Chat (Desktop or Web)

Use Chat when:
- You are exploring ideas and want conversational feedback.
- You need quick clarification on a concept.
- You want to upload a screenshot for Claude to analyze.
- You are **not** modifying files.

### Cowork (Desktop only)

Use Cowork when:
- You are doing research, analysis, or knowledge work across multiple files.
- You want Claude to autonomously complete multi-step tasks.
- You need computer use (macOS) to automate UI interactions.
- You do **not** need version control.

### Code (Desktop or CLI)

Use Code when:
- You are building, testing, or shipping software.
- You need git integration and pull requests.
- You want visual diffs on your screen.
- You are working on a codebase and want Claude to understand project structure.

### CLI (Terminal)

Use CLI when:
- You prefer keyboard-only interfaces.
- You are running Claude in a headless environment (CI/CD, remote server).
- You want to script Claude into your development workflow.
- You are comfortable with text-based diffs.

### Web (Browser)

Use web when:
- You want the quickest setup (no install required).
- You are on a mobile device or low-power machine.
- You are collaborating in a shared Claude workspace.
- You do **not** need file system access or visual diffs.

### Decision Matrix

| Task | Chat | Cowork | Code | CLI | Web |
|------|------|--------|------|-----|-----|
| Quick question | ✅ | | | ✅ | ✅ |
| File analysis | | ✅ | ✅ | ✅ | ✅ |
| Building features | | | ✅ | ✅ | |
| Visual diff review | | | ✅ | | |
| Computer use | ✅ | ✅ | | | |
| Git/PR work | | | ✅ | ✅ | |
| Research task | | ✅ | | | ✅ |
| Production deployment | | | ✅ | ✅ | |

---

## Integration Patterns

### Using Chat + Code Together

1. **Explore in Chat** — Ask questions, get explanations, understand the problem space.
2. **Shift to Code** — Once you know what to build, move to Code with a clear specification.
3. **Iterate visually** — Use Code's diff view for detailed code review.
4. **Back to Chat if needed** — For quick clarifications, jump back to Chat.

### Using Cowork + Code for Complex Projects

1. **Cowork: Research phase** — Gather requirements, analyze market data, competitive landscape.
2. **Code: Build phase** — Implement based on Cowork's findings.
3. **Cowork: Test & monitor phase** — Run QA tests, schedule monitoring tasks.

### Desktop App as Single Pane of Glass

For knowledge workers, the desktop app consolidates workflows:

```
Morning: Cowork tab monitors overnight monitoring reports.
Afternoon: Chat tab discusses findings and strategy.
Evening: Code tab builds the solution based on the day's decision.
```

All in one window, with persistent history and context across modes.

---

## Quick Reference: Desktop App Keyboard Shortcuts

| Action | macOS | Windows |
|--------|-------|---------|
| Quick access overlay | Option-Tap twice | Alt-Tap twice |
| Screenshot | Option-Shift-C | Alt-Shift-C |
| Focus chat input | Cmd-Shift-A | Ctrl-Shift-A |
| Open diff viewer | Cmd-D | Ctrl-D |
| Accept diff | Cmd-Enter | Ctrl-Enter |
| Switch tabs | Cmd-[ / Cmd-] | Ctrl-[ / Ctrl-] |
| Open settings | Cmd-, | Ctrl-, |

---

## Troubleshooting

**Preview not loading?**
- Check that your dev server is running on the expected port.
- Verify environment variables are set correctly.
- Ask Claude to check the build output for errors.

**Computer use not working?**
- Verify you have granted screen recording permission to Claude (System Settings → Privacy & Security → Screen Recording).
- Ensure you are on macOS (computer use is not available on Windows yet).
- Restart the desktop app and try again.

**Diff view showing wrong changes?**
- This usually means Claude made changes you did not expect. Click "Discard" to undo, then ask Claude to explain its approach before trying again.

**Code not syncing with GitHub?**
- Verify your personal access token is valid (check expiration in GitHub settings).
- Ensure the repository URL is correct.
- Try disconnecting and reconnecting the repository.

---

The desktop app is a gateway to deeper integration. With Computer Use enabled, Cowork can orchestrate your entire workflow — running research, executing tests, and filing reports, all without you manually switching between applications.

The real power emerges when you combine modes strategically: Chat for thinking, Cowork for autonomous execution, and Code for building.

**Next up:** [Chapter 20 — Plugins & Marketplaces](./20-plugins.md)

---

## References

- [Claude Desktop App Navigation Tutorial](https://claude.com/resources/tutorials/navigating-the-claude-desktop-app)
- [Cowork Getting Started Guide](https://support.claude.com/en/articles/13345190-get-started-with-cowork)
- [Computer Use Safety Guide](https://support.claude.com/en/articles/computer-use-safety)
