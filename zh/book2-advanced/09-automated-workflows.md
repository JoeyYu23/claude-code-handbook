# 第九章：自动化工作流

## Headless 模式：无交互运行 Claude Code

Claude Code 默认是交互式的：你输入，它响应。但加上 `-p` 标志（或 `--print`）后，它变成无交互的管道工具：

```bash
# 基本用法
claude -p "找出 auth.py 中的所有 TODO 注释"

# 允许工具使用
claude -p "运行测试并修复失败" --allowedTools "Read,Edit,Bash"

# 结构化 JSON 输出
claude -p "分析这个项目" --output-format json | jq '.result'
```

这一模式是 CI/CD 集成、脚本自动化、定时任务的基础。

---

## --print 标志的进阶用法

### 输出格式

```bash
# 纯文本（默认）
claude -p "用一句话描述这个函数"

# JSON（包含 session ID、token 用量等元数据）
claude -p "分析项目依赖" --output-format json

# 流式 JSON（实时 token 流）
claude -p "写一篇分析报告" --output-format stream-json --verbose --include-partial-messages
```

JSON 输出结构：
```json
{
  "result": "文本输出...",
  "session_id": "abc123",
  "is_error": false,
  "usage": {
    "input_tokens": 1200,
    "output_tokens": 350
  }
}
```

### 结构化输出（JSON Schema）

用 `--json-schema` 约束输出格式，响应会被验证是否符合 schema，不符合时自动重试：

```bash
claude -p "从 src/ 中提取所有公开函数名" \
  --output-format json \
  --json-schema '{
    "type": "object",
    "properties": {
      "functions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "file": {"type": "string"},
            "line": {"type": "number"}
          }
        }
      }
    }
  }' | jq '.structured_output.functions'
```

### 最小化模式（--bare）

`--bare` 标志跳过所有项目配置：不加载 hooks、LSP 集成、插件、MCP servers、auto-memory 和 `CLAUDE.md`。启动最快，适合纯模型推理场景：

```bash
# 快速问答，不需要项目配置影响结果
claude -p "二分查找的时间复杂度是多少？" --bare

# 测试场景，确保不受项目 CLAUDE.md 影响
claude -p "分析这段代码" --bare --output-format json
```

`--bare` 适用场景：快速查询、测试、以及明确不希望项目特定配置影响响应的情况。

### 工具权限控制

```bash
# 只允许读文件
claude -p "审查这个代码库" --allowedTools "Read,Grep,Glob"

# 允许特定 git 命令（Bash 的精细控制）
claude -p "暂存所有改动并提交" \
  --allowedTools "Bash(git diff *),Bash(git add *),Bash(git commit *)"
```

`Bash(git diff *)` 的语法：允许所有以 `git diff ` 开头的命令（注意空格后的 `*`）。

### 跨命令保持 Session

```bash
# 第一个请求
SESSION=$(claude -p "分析这个代码库的认证模块" \
  --output-format json | jq -r '.session_id')

# 继续同一个 session
claude -p "现在关注登录流程的安全问题" --resume "$SESSION"

# 继续最近的 session
claude -p "给出修复建议" --continue
```

---

## GitHub Actions 集成

### 快速安装

在 Claude Code 中运行：
```
/install-github-app
```

这会引导你完成 GitHub App 安装和 API key 配置。

### 基础 Workflow：响应 @claude 提及

```yaml
# .github/workflows/claude.yml
name: Claude Code

permissions:
  contents: write
  pull-requests: write
  issues: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, '@claude')
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Claude 自动响应 @claude 提及，无需额外配置
```

使用：
```
# 在任意 PR 或 Issue 的评论中
@claude 请审查这个 PR 的安全问题
@claude 帮我实现 issue #123 描述的功能
@claude 这个测试为什么失败了？
```

### 自动 PR 代码审查

```yaml
# .github/workflows/code-review.yml
name: 自动代码审查

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
            审查这个 PR 的代码改动。关注：
            1. 潜在的 bug 和逻辑错误
            2. 安全漏洞（注入、认证、数据暴露）
            3. 性能问题（N+1 查询、不必要的循环）
            4. 代码风格（是否符合项目规范）

            对每个问题，在对应的代码行发表审查评论。
            最后给出整体评分和总结。
          claude_args: "--max-turns 10"
```

### Issue 自动分类和响应

```yaml
# .github/workflows/triage.yml
name: Issue 自动分类

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
            分析这个新 issue，并：
            1. 添加合适的标签（bug/feature/question/documentation）
            2. 评估优先级（critical/high/medium/low）
            3. 如果是 bug，问用户是否有复现步骤
            4. 如果是功能请求，确认需求是否清晰
            5. 回复用户，告知预计处理时间
          claude_args: "--max-turns 5"
```

### 定时任务：每日代码健康报告

```yaml
# .github/workflows/daily-report.yml
name: 每日代码健康报告

on:
  schedule:
    - cron: "0 9 * * 1-5"  # 工作日每天早 9 点

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整 git 历史

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            生成昨天的代码健康日报：

            1. 昨天的提交摘要（改动了什么）
            2. 新打开的 issue 数量和类型分布
            3. 已关闭的 issue 数量
            4. 当前 open PR 状态
            5. 测试覆盖率趋势（如果有 coverage 报告）

            格式化为 Markdown，创建 issue 发布报告。
          claude_args: "--max-turns 8 --model claude-sonnet-4-6"
```

---

## 脚本化使用模式

### 模式 1：管道处理

```bash
# 把日志直接管道给 Claude 分析
tail -f app.log | claude -p "检测异常并实时报告" --allowedTools "Bash"

# 或者分析历史日志
cat /var/log/app/error.log | claude -p "找出过去 24 小时最频繁的错误类型"
```

### 模式 2：批量文件处理

```bash
# 批量给 Python 文件加类型注解
find src/ -name "*.py" | while read file; do
  echo "处理: $file"
  claude -p "为这个文件的所有函数添加 Python 类型注解，不改变逻辑" \
    --allowedTools "Read,Edit" \
    --resume $(claude -p "读取 $file" --output-format json | jq -r '.session_id')
done

# 更简洁的方式（利用 session 持续性）
claude -p "遍历 src/ 中的所有 Python 文件，为每个函数添加类型注解" \
  --allowedTools "Read,Edit,Glob" \
  --output-format json
```

### 模式 3：条件执行

```bash
#!/bin/bash
# pre-commit 钩子：提交前让 Claude 检查安全问题

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(py|ts|js)$')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "Running Claude security check..."
RESULT=$(git diff --cached | claude -p \
  "审查这些变更是否有安全问题（SQL 注入、XSS、硬编码密钥等）。
   如果没有问题输出 SAFE，如果有问题描述具体的问题。" \
  --output-format json)

REVIEW=$(echo "$RESULT" | jq -r '.result')

if echo "$REVIEW" | grep -qi "injection\|vulnerability\|secret\|password\|exposed"; then
  echo "⚠️  Claude 发现潜在安全问题："
  echo "$REVIEW"
  echo "提交已阻止，请修复后重试。"
  exit 1
fi

echo "✓ 安全检查通过"
exit 0
```

### 模式 4：自定义 Review Bot

```python
#!/usr/bin/env python3
"""GitHub PR 自动审查脚本"""

import subprocess
import json
import sys

def review_pr(pr_number):
    # 获取 PR diff
    diff = subprocess.run(
        ['gh', 'pr', 'diff', str(pr_number)],
        capture_output=True, text=True
    ).stdout

    # 让 Claude 审查
    result = subprocess.run(
        ['claude', '-p',
         f'审查这个 PR diff，给出具体的改进建议:\n\n{diff}',
         '--output-format', 'json'],
        capture_output=True, text=True
    )

    review = json.loads(result.stdout)['result']

    # 发布审查评论
    subprocess.run([
        'gh', 'pr', 'comment', str(pr_number),
        '--body', f'## Claude Code 自动审查\n\n{review}'
    ])

    print(f"PR #{pr_number} 审查完成")

if __name__ == '__main__':
    review_pr(sys.argv[1])
```

---

## 构建自定义自动化管线

### 示例：每周技术债务扫描

```bash
#!/bin/bash
# scripts/weekly-tech-debt.sh
# 每周五运行，生成技术债务报告

set -e

REPORT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="reports/tech-debt-$REPORT_DATE.md"
mkdir -p reports

echo "# 技术债务报告 - $REPORT_DATE" > "$REPORT_FILE"

# 1. TODO/FIXME 统计
echo "## TODO/FIXME 统计" >> "$REPORT_FILE"
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.py" --include="*.ts" \
  | wc -l | xargs -I{} echo "总数：{}" >> "$REPORT_FILE"

# 2. 让 Claude 分析重点
echo "" >> "$REPORT_FILE"
echo "## Claude 分析" >> "$REPORT_FILE"

claude -p "
分析这个代码库的技术债务状况。

重点关注：
1. 最需要重构的 3 个模块（解释原因）
2. 有安全风险的待办事项（TODO/FIXME 中有安全相关的）
3. 测试覆盖率最低的核心模块
4. 过度复杂的函数（超过 100 行或嵌套超过 4 层）

给出优先级排序的处理建议。
" --allowedTools "Read,Grep,Glob,Bash" >> "$REPORT_FILE"

# 3. 如果是工作日，发送到 Slack
if [ "$(date +%u)" -le 5 ]; then
  # 发送到 Slack（需要 SLACK_WEBHOOK_URL 环境变量）
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-type: application/json' \
      -d "{\"text\":\"技术债务报告已生成：$REPORT_FILE\"}"
  fi
fi

echo "报告生成完成：$REPORT_FILE"
```

### 示例：自动依赖更新

```bash
#!/bin/bash
# scripts/auto-update-deps.sh

# 检查过时的依赖
OUTDATED=$(pip list --outdated --format json)

if [ "$(echo "$OUTDATED" | jq length)" -eq 0 ]; then
  echo "所有依赖都是最新的"
  exit 0
fi

echo "发现 $(echo "$OUTDATED" | jq length) 个过时依赖"

# 让 Claude 决定哪些可以安全更新
SAFE_UPDATES=$(echo "$OUTDATED" | claude -p \
  "分析这些过时的 Python 依赖，判断哪些可以安全升级（minor/patch 版本），
   哪些需要谨慎（major 版本变化）。
   对可以安全升级的，直接用 pip install 升级并运行测试验证。
   对需要谨慎的，只列出来，不要自动升级。" \
  --allowedTools "Read,Bash" \
  --output-format json | jq -r '.result')

echo "$SAFE_UPDATES"
```

---

## CI/CD 最佳实践

### 安全

```yaml
# 始终用 secrets，永远不要 hardcode API key
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

# 限制 workflow 权限到最小必要范围
permissions:
  contents: read
  pull-requests: write
  issues: write
  # 不要给不需要的权限
```

### 成本控制

```yaml
# 设置最大轮数防止无限循环
claude_args: "--max-turns 10"

# 使用更便宜的模型处理简单任务
claude_args: "--model claude-haiku-4"

# 添加 workflow 超时
jobs:
  review:
    timeout-minutes: 10
```

### 并发控制

```yaml
# 防止同一 PR 有多个 Claude 同时运行
concurrency:
  group: claude-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

---

## 本章总结

自动化工作流的三个层次：

1. **脚本层**：`claude -p` 作为命令行工具，管道输入输出，条件执行
2. **CI 层**：GitHub Actions 集成，响应 PR/Issue 事件，自动审查
3. **管线层**：定时任务、批量处理、跨工具的复杂自动化

关键点：
- `-p` 标志是所有自动化的入口
- `--allowedTools` 精确控制 CI 中的权限
- `--output-format json` 让输出可以被脚本进一步处理
- 用 `--resume session_id` 实现多步骤工作流的 session 连续性

下一章，我们看如何通过 MCP 扩展 Claude 的工具能力边界。

---

**下一章：** [自定义工具](./10-custom-tools.md)
