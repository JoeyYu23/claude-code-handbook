# 第二十章：团队工作流

## 将 Claude Code 作为团队工具

单个开发者有效使用 Claude Code 是一回事；团队统一使用则是另一回事——而且价值要大得多。当团队共享规范、工具和 Claude 配置时，每位成员都能从积累的知识中受益。代码审查变得更快，新人上手周期缩短，标准得到自动执行而无需反复提醒。

本章涵盖让 Claude Code 在团队层面产生放大效应的关键模式：共享 CLAUDE.md 配置、统一的代码审查、PR 自动化、新人引导工作流以及团队规范。

---

## 在团队内共享 CLAUDE.md

团队级 Claude Code 使用的基础步骤，是将 CLAUDE.md 提交到你的代码仓库。当每位开发者拉取代码时，他们都会获得同一份 Claude 配置，其中编码了团队的标准。

**共享 CLAUDE.md 应包含的内容：**

- 构建、测试和 lint 命令
- 架构规范（代码放在哪里、使用什么模式）
- 仓库工作流（分支命名、提交格式、PR 规范）
- 不那么显眼的环境依赖
- 团队特有的踩坑记录

**不应放进去的内容：**

- 个人偏好（每位开发者有各自的 `~/.claude/CLAUDE.md`）
- 凭据或环境变量
- 过于死板的指令（会削减 Claude 的灵活性）

**初始化：**

```bash
# 根据项目结构生成初始 CLAUDE.md
claude
/init
```

Claude 会分析你的代码库并生成一份起始 CLAUDE.md。审查后添加团队特有的规范，删除不准确的推断，然后提交。

**随时间演进 CLAUDE.md：**

把 CLAUDE.md 当作任何其他代码产物来对待。当团队遇到反复出现的问题——Claude 总是犯某个错误、某条规范被频繁违反——就在 CLAUDE.md 中添加规则并提交。在回顾会议上审查这个文件。删除不再反映现实的指令。

---

## 使用 Claude 进行统一的代码审查

Claude Code 可以在人工审查之前进行第一轮代码审查，捕捉机械性问题，让人工审查者能够专注于设计和逻辑。

**审查技能：**

在 `.claude/skills/review-pr/SKILL.md` 中创建共享审查技能：

```markdown
---
name: review-pr
description: Review the current branch changes for common issues
---
Review all changes in this branch against main.

Check for:
1. Missing tests for new functionality
2. Unhandled error cases
3. Security issues (injection, missing auth checks, exposed secrets)
4. Consistency with patterns in the existing codebase
5. Missing input validation on API endpoints
6. Performance concerns (N+1 queries, missing indexes for new queries)

For each issue found:
- Reference the specific file and line number
- Explain the concern
- Suggest the specific fix

At the end, give an overall assessment: Ready for review / Needs changes before review.
```

任何开发者在提交 PR 前都可以运行 `/review-pr`。这样就能在人工审查者介入之前捕捉容易发现的问题。

**GitHub Actions 集成：**

要在每个 PR 上自动触发审查，可以使用 Claude Code GitHub Action：

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          direct_prompt: |
            Review the changes in this PR.
            Focus on correctness, security, and adherence to our standards in CLAUDE.md.
            Post a review comment summarizing your findings.
```

这会在每个 PR 上运行 Claude Code 并自动发布审查评论。无论是哪位团队成员提交的代码，审查都会一致地捕捉机械性问题。

---

## PR 自动化

除了审查，Claude Code 还能处理 PR 创建中的机械性工作：

**自动提交 PR 的技能：**

```markdown
---
name: submit-pr
description: Create a pull request for the current branch
---
Prepare and submit a pull request for the current branch.

1. Review git log to understand all commits in this branch
2. Write a PR title following conventional commit format: type(scope): description
3. Write a PR description covering:
   - What changes were made and why
   - Testing approach
   - Any deployment considerations
   - Screenshots for UI changes (if applicable)
4. Create the PR using `gh pr create`
5. Add appropriate labels based on change type (bug, feature, refactor, docs)
```

功能完成后，任何开发者运行 `/submit-pr` 即可。PR 描述每次都保持统一且完整。

**自动更新 changelog：**

```markdown
---
name: update-changelog
description: Update CHANGELOG.md with changes since last release
---
Update CHANGELOG.md with all changes since the last version tag.

1. Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline` to get commits
2. Group commits by type: Features, Bug Fixes, Performance, Documentation
3. Write human-readable descriptions (not just commit messages)
4. Add the new section under the [Unreleased] heading
5. Show me the diff for review before committing
```

---

## 新人引导

CLAUDE.md 能显著缩短新开发者的上手时间。但专门的引导技能可以让效果更好：

**创建 `.claude/skills/onboard/SKILL.md`：**

```markdown
---
name: onboard
description: Onboarding walkthrough for new team members
---
Guide the new team member through a codebase orientation.

1. Read CLAUDE.md and summarize the key conventions
2. Explain the project directory structure
3. Walk through how to run the development environment
4. Show the test strategy and how to run tests
5. Explain the git workflow and PR process
6. Identify 2-3 good "starter" tasks from recent GitHub issues
7. Ask if they have any questions

Be welcoming and thorough. Assume no prior familiarity with this codebase.
```

新开发者在第一次会话中运行 `/onboard`。Claude 会根据你的 CLAUDE.md 和项目结构带他们熟悉代码库、回答问题、推荐第一个任务——全程无需高级工程师投入时间。

**补充引导模式：**

对于引导流程较为复杂的团队，可以创建一份专门的引导文档，并在 CLAUDE.md 中引用：

```markdown
# CLAUDE.md（节选）
新团队成员请先阅读 docs/ONBOARDING.md。
该文档涵盖开发环境搭建、关键架构决策以及常见的踩坑点。
```

---

## 通过技能沉淀知识

`.claude/skills/` 中的技能文件会纳入版本控制，这意味着团队积累的工作流知识会自动共享：

**值得构建的常用团队技能：**

```
.claude/skills/
├── fix-issue/        # 端到端解决一个 GitHub issue
├── review-pr/        # 提交前进行代码审查
├── submit-pr/        # 创建规范的 PR
├── db-migration/     # 创建并测试数据库迁移
├── add-endpoint/     # 按团队规范添加新 API 端点
├── onboard/          # 新开发者引导
└── deploy-check/     # 部署前检查清单
```

每个技能都以可执行的形式封装了团队知识。新开发者不需要背 PR 检查清单——运行 `/submit-pr` 就行。不经常写迁移的工程师不需要把迁移流程烂熟于心——运行 `/db-migration` 就行。

**如何以团队方式构建技能：**

最好的技能来自真实的工作流。当有人发现自己在重复同一个多步骤流程时：

1. 让 Claude 为其编写技能："请为我们团队编写一个技能，自动化我们每次手动做的数据库迁移工作流"
2. 审查并完善该技能
3. 提交到 `.claude/skills/`
4. 告知团队（在 Slack 发条消息，或在早会上提一句）

随着时间推移，技能目录会成为团队专业知识的编码库。

---

## 团队规范

有些团队规范通过 hooks 来执行比通过 CLAUDE.md 指令更有效。两者的区别在于：hooks 是确定性的，无论 Claude 在做什么都会运行；CLAUDE.md 指令是建议性的。

**强制提交信息格式：**

```json
// .claude/settings.json（纳入版本控制）
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/validate-commit-msg.sh",
            "description": "Validate conventional commit format"
          }
        ]
      }
    ]
  }
}
```

```bash
# .claude/hooks/validate-commit-msg.sh
#!/bin/bash
# Validates that Claude's git commit messages follow conventional commits
# Only runs on git commit commands
if echo "$CLAUDE_TOOL_INPUT" | grep -q "git commit"; then
  if ! echo "$CLAUDE_TOOL_INPUT" | grep -qE "^git commit.*\"(feat|fix|refactor|docs|test|chore|perf)(\(.+\))?: .+\""; then
    echo "Commit message must follow conventional commits: type(scope): description" >&2
    exit 1
  fi
fi
exit 0
```

**阻止向受保护目录写入：**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"$CLAUDE_TOOL_INPUT\" | python3 .claude/hooks/check-protected-paths.py'",
            "description": "Block writes to migrations directory without explicit confirmation"
          }
        ]
      }
    ]
  }
}
```

---

## 在组织层面管理 Claude Code

对于规模较大的组织，托管设置和托管 CLAUDE.md 文件可以实现跨所有开发者的统一配置，无需各自单独设置：

**托管 CLAUDE.md**（由 IT 部门部署到系统路径）：
```
macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
Linux: /etc/claude-code/CLAUDE.md
```

该文件对机器上所有用户生效，且不能被个人设置排除。用于组织级标准：安全策略、合规要求、已审批的工具列表。

**托管 MCP 服务器：**
```
macOS: /Library/Application Support/ClaudeCode/managed-mcp.json
Linux: /etc/claude-code/managed-mcp.json
```

这让每位开发者自动获得已审批的 MCP 工具集（内部工具、已审批的外部服务），无需个人配置。

要在团队层面监控使用情况，Claude Code 提供 OpenTelemetry 指标，可以接入你现有的可观测性系统，实现按开发者和按项目的 token 用量追踪。

---

**下一章：** [第七章 — 远程连接](./07-remote-connection.md) — 跨机器、跨设备、跨地点工作。
