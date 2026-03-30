# Handbook Audit Fix Plan

**Created:** 2026-03-30
**Audit source:** 3 parallel Opus agents cross-verified against official Anthropic docs
**Total issues:** 22 待修 + 7 缺失功能

---

## Batch 1: Quick Fixes（~30 min，纯文本替换）

这些是简单的事实性错误，改几行就行。

### 1.1 快捷键修复 — `en/book1-getting-started/keyboard-shortcuts.md` + ZH 对应

| 错误 | 修改 |
|------|------|
| `Ctrl+F` = kill background agents | 改为 `Ctrl+X Ctrl+K`（chord sequence）。注明需按两次键。 |
| `Option+T` / `Alt+T` = toggle thinking | 改为 `Cmd+T` / `Meta+T`（macOS/Linux） |
| `Option+P` / `Alt+P` = model picker | 改为 `Cmd+P` / `Meta+P` |

### 1.2 Voice 语言数 — `en/book2-advanced/22-voice-fast-effort.md` + ZH

- "50+ languages and dialects" → "20 languages (as of March 2026)"
- 加注：语言数量在持续增加，查 official docs 获取最新列表

### 1.3 Worktree 路径 — `en/book2-advanced/18-multi-session.md` + ZH

- `../<repo>-<name>/` → `.claude/worktrees/<name>`
- 与 Ch.21 的描述保持一致

### 1.4 MEMORY.md 加载限制 — `en/book1-getting-started/15-memory.md` + ZH

- "first 200 lines" → "first 200 lines or 25KB, whichever comes first"

### 1.5 CLAUDE.md scope — `en/book1-getting-started/14-claude-md.md` + ZH

- 加第四层 scope："Managed policy"
- 路径：macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`
- 说明：由 IT/DevOps 部署，优先级最高

### 1.6 Figma MCP URL — `en/book3-architect/mcp-registry.md` + ZH

- `/sse` → 验证后改为 `/mcp`（如果确认）

---

## Batch 2: Permission Modes 重写（~45 min）

### 2.1 Shift+Tab 循环 — `en/book1-getting-started/06-permission-modes.md` + ZH

**现状错误：** 描述为 3 个模式循环（default → acceptEdits → plan → default）

**应改为：**
```
默认循环（3 模式）：default → acceptEdits → plan → default
启用 auto 后（4 模式）：default → acceptEdits → plan → auto → default
  启用方式：--enable-auto-mode 或在 settings 中配置
启用 bypass 后：default → acceptEdits → plan → bypassPermissions → default
```

### 2.2 Auto Mode 补充要求

在 Auto Mode 段落添加：
- 需要 Claude Sonnet 4.6 或 Opus 4.6 模型
- 需要 `--enable-auto-mode` flag 才会出现在 Shift+Tab 循环中
- Enterprise 支持仍在 "rolling out"，不要说已经可用

### 2.3 DontAsk mode 补充

添加说明：如果 tool 有 `ask` rule，在 DontAsk 模式下会被 deny（不是 prompt）

---

## Batch 3: Book 3 Ch.1 Harness Engineering 重写（~1.5 小时，最大改动）

### 3.1 Hooks 配置格式 — `en/book3-architect/01-harness-engineering.md` + ZH

**现状错误：**
- 使用了不存在的 `hooks.json` 文件
- 使用了错误的事件名 `"Edit"` 和 `"Stop"` 作为顶级 key

**应改为：**
```json
// 正确格式：在 settings.json 的 "hooks" key 下
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Edit\" || tool == \"Write\"",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-edit.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/post-task-check.sh"
          }
        ]
      }
    ]
  }
}
```

使用官方文档的事件名：`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `Notification`, `SubagentStart`, `SubagentStop`, etc.

### 3.2 Settings.json 格式 — 同文件

**现状错误：** 编造了 `force-branch`, `blocked-commands`, `require-approval` 字段

**应改为：** 使用真实的 permissions 格式
```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": [
      "Bash(npm test:*)",
      "Bash(git status:*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  }
}
```

---

## Batch 4: Book 3 Ch.3 Scheduled Tasks 修复（~30 min）

### 4.1 Desktop tasks 格式 — `en/book3-architect/03-scheduled-tasks.md` + ZH

**现状错误：** 描述了不存在的 `desktop-tasks.json` 配置

**应改为：**
- Desktop scheduled tasks 存储为 `~/.claude/scheduled-tasks/<task-name>/SKILL.md`
- 需要 Claude Desktop App 保持打开
- 使用 SKILL.md 标准格式（frontmatter + body）

---

## Batch 5: Book 3 Ch.4 Cloud/Remote 修复（~45 min）

### 5.1 Provider 配置命令 — `en/book3-architect/04-cloud-remote.md` + ZH

**现状错误：** 使用了不存在的 `claude config set provider bedrock` 命令

**应改为：** 使用环境变量
```bash
# Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_DEFAULT_SONNET_MODEL="us.anthropic.claude-sonnet-4-6-20260320-v1:0"

# Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION="us-east5"

# Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
```

### 5.2 删除或标注不可靠的内容

- `claude config set provider litellm` — LiteLLM 是第三方工具，不是原生 provider。改为说明通过 proxy URL 配置
- `claude connector create` — 无法验证，标注为 "experimental/unconfirmed"
- `network-policy.yaml` — 无法验证，删除或标注

---

## Batch 6: 安全章节修复（~20 min）

### 6.1 `.claudeignore` 可靠性 — `en/book3-architect/08-security.md` + ZH

添加警告：
> ⚠️ `.claudeignore` 有已知的绕过问题（参见 [GitHub Issue #579](https://github.com/anthropics/claude-code/issues/579)）。对于安全敏感文件，建议使用 `permissions.deny` 规则作为更可靠的替代方案。

### 6.2 VS Code MCP 描述 — `en/book1-getting-started/16-ide-integration.md` + ZH

修正：built-in MCP server 只对模型暴露 `getDiagnostics` 和 `executeCode` 两个 tool。文件访问和选择是内部 RPC，不是 MCP tool。

---

## Batch 7: 新功能章节（Optional，~2-3 小时）

按重要性排序，可以后续 session 逐步添加：

### 7.1 Computer Use（高优先）

新建章节或在 Ch.19 (Desktop App) 中添加 section：
- Claude Code 可以控制屏幕（点击、导航、截图）
- 2026 年 3 月发布
- 需要 macOS + Pro/Max 订阅
- 安全注意事项

### 7.2 `/btw` 命令（中优先）

在 Ch.1 (Slash Commands) 中已有描述，但应在 Ch.15 (Context Management) 中也提到：
- 零上下文成本的旁路查询
- 适合快速查找不想污染主上下文的问题

### 7.3 Rules 目录 `.claude/rules/*.md`（中优先）

在 Ch.14 (CLAUDE.md) 或 Ch.17 (Memory Architecture) 中添加：
- 替代 CLAUDE.md 的规则组织方式
- 支持 `paths:` frontmatter 做路径限定
- 适合大型项目按模块组织规则

### 7.4 `settings.local.json`（中优先）

在 Ch.1 (Harness Engineering) 或 Ch.5 (CLAUDE.md Patterns) 中添加：
- `.claude/settings.local.json` 自动 gitignored
- 适合个人配置（不影响团队）

### 7.5 PowerShell Tool（低优先）

Windows 用户在 2026-03 获得了原生 PowerShell tool。在 Ch.9 (Running Commands) 中简要提及。

---

## 执行顺序建议

```
Session 1（~2.5 小时）：Batch 1 + Batch 2 + Batch 6
  → 修快捷键、权限模式、安全、小修复
  → commit + push

Session 2（~2 小时）：Batch 3 + Batch 4 + Batch 5
  → 重写 Book 3 的配置格式错误
  → commit + push

Session 3（optional，~2-3 小时）：Batch 7
  → 补新功能章节
  → commit + push
```

**每个 batch 改完英文后，立即同步改中文，保持一致。**

---

## 验证方法

每个改动完成后：
1. `grep -r` 搜索被替换的旧内容，确保没有遗漏
2. 对比 EN 和 ZH 的改动行数，确保对称
3. 关键命令/快捷键改动后，web search 再次验证

## 参考文档

- [Official Claude Code Docs](https://code.claude.com/docs/en/overview)
- [Permission Modes](https://code.claude.com/docs/en/permission-modes)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Keybindings](https://code.claude.com/docs/en/keybindings)
- [Memory](https://code.claude.com/docs/en/memory)
- [Scheduled Tasks](https://code.claude.com/docs/en/scheduled-tasks)
- [API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Third-party Integrations](https://code.claude.com/docs/en/third-party-integrations)
