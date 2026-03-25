# 第八章：Hook 系统深入

## Hook 是什么？

Hook 是在 Claude Code session 的关键时刻自动执行的命令。它们不是 Claude 调用的——而是系统在特定事件发生时直接执行的 shell 命令、HTTP 请求、LLM 提示词或 agent。

Hook 的典型用途：
- 保存文件后自动格式化
- 执行命令前验证安全性
- 任务完成后发送通知
- 拦截并记录所有文件改动

这与 Skills 完全不同：Skills 是 Claude 的扩展，Hook 是系统级的自动化。

---

## 完整事件列表

Claude Code 支持以下所有 hook 事件：

**Session 生命周期：** `SessionStart`、`InstructionsLoaded`、`SessionEnd`

**用户交互：** `UserPromptSubmit`、`Elicitation`、`ElicitationResult`、`Notification`

**工具执行：** `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PostToolUseFailure`

**任务控制：** `Stop`、`StopFailure`、`TaskCompleted`

**Sub-agent 与 Teammate：** `SubagentStart`、`SubagentStop`、`TeammateIdle`

**上下文与配置：** `ConfigChange`、`PreCompact`、`PostCompact`、`CwdChanged`、`FileChanged`

**Worktree：** `WorktreeCreate`、`WorktreeRemove`

## Hook 生命周期图

```
SessionStart → InstructionsLoaded
    ↓
UserPromptSubmit
    ↓
[Agentic Loop]:
    PreToolUse → PermissionRequest → Tool 执行 → PostToolUse / PostToolUseFailure
    SubagentStart / SubagentStop
    TeammateIdle（Agent Teams 模式下）
    TaskCompleted
    ↓
Stop / StopFailure
    ↓
SessionEnd
```

随时可能发生的异步事件：
- `WorktreeCreate` / `WorktreeRemove`
- `Notification`
- `ConfigChange`
- `CwdChanged`
- `FileChanged`
- `Elicitation` / `ElicitationResult`
- `PreCompact` / `PostCompact`

---

## 四种 Hook 类型

### 类型 1：Command Hook

执行 shell 命令，是最常用的类型：

```json
{
  "type": "command",
  "command": ".claude/hooks/validate.sh",
  "async": false,
  "timeout": 600
}
```

- `async: true`：异步执行，不阻塞 Claude
- `timeout`：秒数，默认 600 秒

**退出码语义**：
- `0`：成功（从 stdout 解析 JSON 输出）
- `2`：阻塞错误（stderr 的内容作为反馈给 Claude）
- 其他：非阻塞错误（记录但不中断流程）

### 类型 2：HTTP Hook

向 HTTP 端点发送 POST 请求：

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/validate",
  "headers": {
    "Authorization": "Bearer $MY_TOKEN"
  },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

适合集成外部系统（Slack、JIRA、内部服务等）。

### 类型 3：Prompt Hook

用 Claude 本身来判断是否允许某个操作：

```json
{
  "type": "prompt",
  "prompt": "这个 Bash 命令安全吗？仔细检查是否有破坏性操作：$ARGUMENTS",
  "model": "claude-3-5-haiku",
  "timeout": 30
}
```

响应格式：`{ "ok": true, "reason": "..." }`

### 类型 4：Agent Hook

启动一个有工具访问权限的 sub-agent 来验证条件：

```json
{
  "type": "agent",
  "prompt": "验证所有测试通过。如果有失败的测试，阻止操作。",
  "timeout": 60
}
```

---

## Hook 配置位置

```json
// settings.json 或 settings.local.json 中
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh"
          }
        ]
      }
    ]
  }
}
```

配置文件位置：

| 文件 | 范围 | 是否可提交 |
|------|------|-----------|
| `~/.claude/settings.json` | 所有项目 | 否（个人） |
| `.claude/settings.json` | 当前项目 | 是（团队共享）|
| `.claude/settings.local.json` | 当前项目 | 否（本地专属）|
| 插件 `hooks/hooks.json` | 插件启用时 | 是 |

---

## 关键 Hook 事件详解

### PreToolUse — 工具调用前

在 Claude 使用任何工具前触发。可以检查、修改或阻止工具调用。

Hook 接收的 JSON 输入（通过 stdin）：

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/old-data"
  }
}
```

**示例：阻止危险命令**

```bash
#!/bin/bash
# .claude/hooks/validate-bash.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# 阻止危险操作
if echo "$COMMAND" | grep -qE '(rm -rf /|format|:(){:|;|DROP TABLE)'; then
  # 输出 JSON 来拒绝
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "危险命令被阻止：包含破坏性操作"
    }
  }'
  exit 0
fi

exit 0  # 允许
```

配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-bash.sh"
          }
        ]
      }
    ]
  }
}
```

**决策控制**：PreToolUse 可以返回三种决策：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",    // 允许（绕过正常权限检查）
    // 或 "deny"                       // 拒绝
    // 或 "ask"                        // 照常弹出权限提示
    "permissionDecisionReason": "解释原因",
    "updatedInput": {                  // 可选：修改工具输入
      "command": "安全的替代命令"
    }
  }
}
```

### PostToolUse — 工具调用后

工具成功执行后触发。

**示例：保存文件后自动格式化**

```bash
#!/bin/bash
# .claude/hooks/format-after-edit.sh

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE" ]; then exit 0; fi

# 根据文件类型格式化
case "${FILE##*.}" in
  py)
    python -m black "$FILE" 2>/dev/null
    python -m isort "$FILE" 2>/dev/null
    ;;
  ts|tsx|js|jsx)
    npx prettier --write "$FILE" 2>/dev/null
    ;;
  go)
    gofmt -w "$FILE" 2>/dev/null
    ;;
esac

exit 0
```

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/format-after-edit.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

注意 `async: true`——格式化不需要阻塞 Claude 的下一个操作。

### Stop — 阻止 Claude 停止

当 Claude 认为任务完成并准备停止时触发。可以用来强制 Claude 先满足某些条件：

**示例：提交前确保测试通过**

```bash
#!/bin/bash
# .claude/hooks/require-tests-pass.sh

INPUT=$(cat)
# 检查 Claude 是否在做 git commit 相关的事情
STOP_REASON=$(echo "$INPUT" | jq -r '.stop_reason // empty')

# 运行测试
if ! python -m pytest --tb=no -q 2>/dev/null; then
  echo "测试未通过，请先修复失败的测试再提交" >&2
  exit 2  # 阻止停止，Claude 需要继续工作
fi

exit 0  # 允许停止
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/require-tests-pass.sh"
          }
        ]
      }
    ]
  }
}
```

### Notification — 任务完成通知

当 Claude Code 需要发送通知时触发（任务完成、等待用户输入等）：

**示例：macOS 桌面通知**

```bash
#!/bin/bash
# ~/.claude/hooks/notify.sh

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code 需要你的关注"')

# macOS
osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\""

# 或者使用 terminal-notifier（如果安装了）
# terminal-notifier -message "$MESSAGE" -title "Claude Code"

exit 0
```

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notify.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### SessionStart — Session 启动时注入上下文

在 session 开始时运行，可以注入动态上下文：

**示例：注入今日工单列表**

```bash
#!/bin/bash
# .claude/hooks/inject-context.sh

# 获取今天分配给我的工单
TICKETS=$(gh issue list --assignee @me --json number,title --limit 10 2>/dev/null)

if [ -n "$TICKETS" ]; then
  # 通过 hookSpecificOutput 注入上下文
  jq -n --argjson tickets "$TICKETS" '{
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: ("今日待处理工单：\n" + ($tickets | map("#" + (.number|tostring) + " " + .title) | join("\n")))
    }
  }'
fi

exit 0
```

### SubagentStop — Sub-agent 完成时

当一个 sub-agent 完成工作时触发：

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "code-reviewer",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/post-review-cleanup.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### PostToolUseFailure — 工具调用失败时

工具调用失败时触发（与 PostToolUse 不同，此事件在出错时触发）。用于记录失败日志、异常报警或触发备用行为：

```json
{
  "hooks": {
    "PostToolUseFailure": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/log-failure.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### TeammateIdle — Teammate 等待时（实验性）

在 Agent Teams 实验模式下，当一个 teammate 完成当前任务并等待新工作时触发。用于协调 teammate 之间的工作分配。

### InstructionsLoaded — 指令加载后

在 `CLAUDE.md` 文件和其他指令来源在 session 启动时加载完成后触发。可以用来在静态指令就位后注入额外的动态上下文：

```bash
#!/bin/bash
# .claude/hooks/inject-dynamic-context.sh
SPRINT=$(cat .current-sprint 2>/dev/null || echo "unknown")
jq -n --arg sprint "$SPRINT" '{
  hookSpecificOutput: {
    hookEventName: "InstructionsLoaded",
    additionalContext: ("当前 Sprint：" + $sprint)
  }
}'
exit 0
```

### PreCompact / PostCompact — 压缩前后

在 `/compact` 操作前后触发。`PreCompact` 可以添加需要在摘要中保留的信息；`PostCompact` 可以在新对话中注入新鲜的上下文。

### CwdChanged — 工作目录变更时

当 session 期间当前工作目录发生变更时触发（例如使用了 `/add-dir`）。可以用来加载特定目录的上下文或更新环境变量。

### FileChanged — 外部文件变更时

当磁盘上的文件在 Claude 直接编辑之外发生变更时触发（例如构建系统输出或外部工具写入项目）。可以用来通知 Claude 外部变更。

### Elicitation / ElicitationResult — MCP 结构化输入请求

`Elicitation` 在 MCP server 向用户请求结构化输入时触发，可以自动提供凭证、配置值或其他输入，无需用户手动干预。`ElicitationResult` 在 elicitation 解决后触发，包含所提供的值。

---

## Matcher 模式

Matcher 是正则表达式，用于过滤 hook 触发条件：

| 事件 | Matcher 匹配的是 | 示例 |
|------|----------------|------|
| 工具事件 | 工具名称 | `Bash`、`Edit\|Write`、`mcp__.*` |
| SessionStart/End | 启动方式 | `startup`、`resume`、`clear` |
| Notification | 通知类型 | `permission_prompt`、`idle_prompt` |
| SubagentStart/Stop | agent 类型名 | `Explore`、`Plan`、`code-reviewer` |
| ConfigChange | 配置来源 | `project_settings`、`user_settings` |

**MCP 工具 matcher**：`mcp__<server>__<tool>`

```json
// 只对特定 MCP server 的工具触发
{
  "matcher": "mcp__github__.*"
}
```

---

## 在 Skills 和 Agents 中定义 Hook

Hook 不只能在 settings.json 里定义，也可以在 skill 或 agent 的 frontmatter 中定义——这样 hook 只在该 skill/agent 激活期间有效：

```yaml
---
name: strict-editor
description: 编辑代码时自动 lint 并拒绝低质量代码
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/strict-lint.sh"
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: ".claude/hooks/validate-bash.sh"
---

编辑代码时保持极高的代码质量标准。
```

---

## 实战配置示例：完整的项目 Hook 设置

这是一个适合大多数 Python/TypeScript 项目的 hook 配置：

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-start.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-bash.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/format.sh",
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/pre-stop.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notify.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

对应的 hook 脚本都放在 `.claude/hooks/` 目录，提交到版本控制，团队共享。

---

## 安全注意事项

### 防止 Shell 注入

Hook 接收的 JSON 来自 Claude，**永远不要直接把 JSON 字段插入 shell 命令**：

```bash
# 危险！
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
eval "$COMMAND"  # 如果 command 包含 ; rm -rf / 就完了

# 安全的做法：用 jq 解析，再做严格检查
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if echo "$COMMAND" | grep -qE '^[a-z0-9 _./-]+$'; then
  # 只允许简单命令
  eval "$COMMAND"
fi
```

### 避免 Shell Profile 输出干扰 JSON

如果你的 `.bashrc` 或 `.zshrc` 有输出（比如 `echo "Welcome!"` 或 `neofetch`），这些输出会污染 hook 的 JSON 响应。

解决方法：在 hook 脚本开头加上 `exec 2>/dev/null` 或检查是否是交互式 shell。

### 异步 vs 同步

默认同步：Claude 等待 hook 完成再继续。
- 用于：需要结果的验证（lint、安全检查）
- 风险：慢的 hook 会阻塞 Claude

`async: true`：Claude 继续运行，hook 在后台执行。
- 用于：通知、日志、格式化
- 注意：异步 hook 的输出和决策 Claude 不会等待

---

## 查看和调试 Hook

```
/hooks
```

在 Claude Code 中运行 `/hooks`，查看所有已配置的 hook 及其状态。

临时禁用所有 hook（调试时）：

```json
{
  "disableAllHooks": true
}
```

---

## 本章总结

Hook 系统是 Claude Code 中最接近"底层自动化"的机制。与 Skills 不同，Hook 不经过 LLM——它们是纯粹的系统事件响应器。

核心应用场景：
- **PreToolUse**：安全验证、命令过滤、修改工具输入
- **PostToolUse**：自动格式化、lint、日志记录
- **Stop**：强制满足前置条件（测试通过、lint 通过）
- **Notification**：桌面通知、Slack 消息、邮件
- **SessionStart**：注入动态上下文

下一章，我们看如何在 CI/CD 中无人值守地运行 Claude Code。

---

**下一章：** [自动化工作流](./09-automated-workflows.md)
