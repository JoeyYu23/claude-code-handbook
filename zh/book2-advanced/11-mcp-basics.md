# 第十一章：MCP 基础

## Model Context Protocol 是什么？

MCP（Model Context Protocol）是由 Anthropic 开发并开源的通信协议，专门用于连接 AI 工具（如 Claude）与外部数据源和服务。它是 AI 领域的"USB 标准"——一旦设备支持 USB，你就可以把任何 USB 设备插上去；同样，一旦 AI 工具支持 MCP，你就可以连接任何 MCP server。

**没有 MCP 的世界**：

每个 AI 工具需要为 GitHub、Slack、数据库、监控系统分别写集成代码。100 个工具 × 100 个服务 = 10,000 个集成。

**有了 MCP 的世界**：

每个服务只需要实现一次 MCP server；每个 AI 工具只需要实现一次 MCP client。100 个工具 + 100 个服务 = 200 个实现，而不是 10,000 个。

---

## MCP 的重要性

从 Claude Code 的角度，MCP 的价值在于：

1. **突破边界**：不只能读本地文件，可以查询任意外部系统
2. **统一接口**：无论连接什么服务，从 Claude 的视角使用方式完全一致
3. **生态共享**：社区开发的 MCP server 所有支持 MCP 的 AI 工具都能用
4. **安全隔离**：每个 MCP server 是独立进程，权限可以精确控制

---

## MCP 架构：Servers、Clients、Transports

### 三个核心角色

```
┌─────────────────────────────────────────────┐
│  MCP Client（Claude Code）                   │
│  - 管理 server 连接                          │
│  - 发现可用工具                              │
│  - 调用工具，获取结果                         │
└─────────────────────┬───────────────────────┘
                      │ MCP Protocol
          ┌───────────┴───────────┐
          │                       │
┌─────────▼──────┐     ┌─────────▼──────┐
│ MCP Server A   │     │ MCP Server B   │
│ (GitHub)       │     │ (PostgreSQL)   │
│ - 工具定义     │     │ - 工具定义     │
│ - 工具执行     │     │ - 工具执行     │
└───────────┬────┘     └────┬───────────┘
            │               │
         GitHub API    PostgreSQL
```

**MCP Client**：Claude Code 内置的 client，管理所有 server 连接，把工具调用路由到正确的 server。

**MCP Server**：独立运行的进程（或远程服务），实现具体的工具逻辑。可以是本地程序，也可以是远程 HTTP 服务。

**Transport**：Client 和 Server 之间的通信方式。

### 三种 Transport 类型

**stdio**（标准输入输出）：

```
Claude Code ←─── stdin/stdout ───→ 本地进程
```

- 最常用于本地工具
- Server 是你机器上运行的程序
- 适合：数据库客户端、CLI 工具封装、内部 API 的本地代理

```bash
# stdio transport 示例
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@localhost:5432/mydb"
```

**HTTP（Streamable HTTP）**：

```
Claude Code ←─── HTTPS ───→ 远程 HTTP Server
```

- 连接云服务
- Server 运行在互联网某处
- 适合：SaaS 工具（GitHub、Sentry、Notion 等）

```bash
# HTTP transport 示例
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**SSE（Server-Sent Events）**：

```
Claude Code ←─── SSE + HTTP POST ───→ 远程服务
```

> 注意：SSE 传输已废弃，优先使用 HTTP 传输。

---

## Claude Code 如何使用 MCP

### 工具发现

Claude Code 在 session 启动时自动连接所有配置的 MCP server，并收集它们提供的工具列表：

```
Session 启动：
  ├── 连接 github MCP server → 发现 15 个工具
  ├── 连接 postgres MCP server → 发现 5 个工具
  └── 连接 sentry MCP server → 发现 8 个工具

可用工具（除内置工具外）：
  github__create_pull_request
  github__list_issues
  github__create_issue
  ...（更多 GitHub 工具）
  postgres__query
  postgres__describe_table
  ...（更多数据库工具）
  sentry__list_issues
  ...（更多 Sentry 工具）
```

### 工具调用流程

```
用户："在 GitHub 上创建一个 PR，描述是修复用户认证 bug"
    ↓
Claude 决定使用 github__create_pull_request 工具
    ↓
Claude Code 向 GitHub MCP server 发送请求：
{
  "method": "tools/call",
  "params": {
    "name": "create_pull_request",
    "arguments": {
      "title": "fix: 修复用户认证 bug",
      "body": "...",
      "base": "main"
    }
  }
}
    ↓
GitHub MCP server 调用 GitHub API
    ↓
返回 PR URL 和详情
    ↓
Claude 把结果告诉用户
```

### MCP Prompts 作为命令

MCP server 除了提供工具，还可以提供"prompts"——这些 prompts 出现在 Claude Code 的 `/` 命令菜单中：

```
/mcp__github__list_prs            # 列出 PR
/mcp__github__pr_review 456       # 审查指定 PR
/mcp__jira__create_issue "Bug in login" high  # 创建 JIRA 工单
```

---

## 发现和安装 MCP Servers

### 官方 MCP 注册表

通过 Claude Code 直接浏览：

```
/mcp
# 或
claude mcp list
```

常用 server 快速安装命令：

```bash
# GitHub
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Sentry 错误监控
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp

# PostgreSQL
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@host:5432/dbname"

# Playwright（浏览器自动化）
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest

# 文件系统（扩展权限）
claude mcp add --transport stdio filesystem -- \
  npx -y @modelcontextprotocol/server-filesystem /path/to/directory
```

### 从 Claude Desktop 导入

如果你已经在 Claude Desktop 中配置了 MCP servers：

```bash
claude mcp add-from-claude-desktop
# 交互式界面选择要导入的 server
```

### 从 Claude.ai 同步

用 Claude.ai 账号登录 Claude Code 后，在 claude.ai 设置的 MCP server 会自动同步到 Claude Code。

---

## 配置方法详解

### 命令行添加（最常用）

```bash
# HTTP server
claude mcp add --transport http <name> <url>

# stdio server
claude mcp add --transport stdio <name> -- <command> [args...]

# 带环境变量
claude mcp add --transport stdio --env API_KEY=your-key myserver -- node server.js

# 带自定义 header（用于认证）
claude mcp add --transport http --header "Authorization: Bearer token" myapi https://api.example.com/mcp
```

### JSON 配置（适合复杂配置）

```bash
claude mcp add-json myserver '{
  "type": "stdio",
  "command": "python",
  "args": ["/path/to/server.py"],
  "env": {
    "API_KEY": "your-key"
  }
}'
```

### .mcp.json 文件（团队共享）

```json
// .mcp.json（提交到版本控制）
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "internal-db": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub"],
      "env": {
        "DB_DSN": "${DB_DSN}"  // 从环境变量读取
      }
    },
    "deploy-tools": {
      "type": "stdio",
      "command": "${CLAUDE_PROJECT_DIR}/.claude/mcp-servers/deploy/server.py",
      "args": [],
      "env": {
        "DEPLOY_TOKEN": "${DEPLOY_TOKEN}"
      }
    }
  }
}
```

团队成员只需在 `.env` 文件中设置各自的变量值，不需要手动运行 `claude mcp add`。

### 配置作用域

| 作用域 | 标志 | 存储位置 | 用途 |
|--------|------|---------|------|
| local（默认）| `--scope local` | `~/.claude.json`（项目路径下）| 个人使用，不共享 |
| project | `--scope project` | `.mcp.json` | 团队共享 |
| user | `--scope user` | `~/.claude.json`（全局）| 跨项目个人工具 |

```bash
# 个人使用，不共享（默认）
claude mcp add --transport http myprivate https://my-service.com/mcp

# 团队共享（写入 .mcp.json）
claude mcp add --transport http --scope project github https://api.githubcopilot.com/mcp/

# 跨项目个人工具
claude mcp add --transport stdio --scope user filesystem -- \
  npx -y @modelcontextprotocol/server-filesystem ~/Downloads
```

---

## OAuth 认证

许多云服务的 MCP server 需要 OAuth 认证：

```bash
# 1. 添加 server
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 2. 触发认证
# 在 Claude Code 中：
/mcp
# 选择 sentry，点击 Authenticate

# 3. 在浏览器中完成登录
# 认证 token 安全存储在系统钥匙串（macOS）
```

认证 token 自动刷新，无需手动维护。

---

## 管理 MCP Servers

```bash
# 列出所有 server
claude mcp list

# 查看特定 server 详情
claude mcp get github

# 删除 server
claude mcp remove github

# 在 Claude Code 中查看状态（连接是否正常）
/mcp
```

---

## MCP 输出限制

MCP 工具有时会返回大量数据（比如查询大型数据集）。

**默认限制**：单个 MCP 工具输出超过 10,000 tokens 时显示警告；超过 25,000 tokens 时截断。

**调整限制**：

```bash
# 临时调高
export MAX_MCP_OUTPUT_TOKENS=50000
claude

# 或在 settings.json 中永久设置
# "env": { "MAX_MCP_OUTPUT_TOKENS": "50000" }
```

对于经常返回大量数据的工具，建议在工具设计时就加入分页或过滤参数。

---

## 动态工具更新

当 MCP server 更新了它的工具列表（添加了新工具或删除了旧工具），Claude Code 支持动态刷新——无需重启 session。Server 发送 `list_changed` 通知后，Claude Code 自动同步最新工具列表。

---

## MCP 与 Claude Code 的双向关系

有趣的是，Claude Code 本身也可以作为 MCP server 被其他应用使用：

```bash
# 启动 Claude Code 作为 MCP server
claude mcp serve
```

这让其他支持 MCP 的工具（比如你自己写的应用）能使用 Claude Code 的所有工具（Read、Edit、Bash 等）。

在 Claude Desktop 中使用：

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}
```

---

## 安全注意事项

MCP server 有访问你系统的能力，使用第三方 server 时需要注意：

1. **只安装可信来源的 server**：优先使用官方 server 或知名开源项目
2. **最小权限原则**：数据库连接用只读账户；文件系统 server 只开放需要的目录
3. **项目 scope 需确认**：Claude Code 遇到 `.mcp.json` 时会弹出确认提示，仔细阅读
4. **Prompt 注入风险**：连接能获取外部内容的 MCP server 时，外部内容可能包含恶意指令

---

## 本章总结

MCP 是 AI 工具生态的基础设施。理解它的架构帮助你：

1. **快速集成**：用 `claude mcp add` 连接任意 MCP server
2. **团队协作**：用 `.mcp.json` 共享 server 配置
3. **自定义构建**：在上一章学到的基础上，现在理解了协议层面的工作方式
4. **安全使用**：理解权限模型，谨慎选择 server

MCP 生态系统在快速发展。社区已有数百个 MCP server 覆盖各种服务，从数据库到设计工具，从监控到项目管理。掌握 MCP 的配置和管理，意味着你能随时把任何服务的能力接入 Claude Code。

---

**至此，进阶指南 Part I-IV 已完成。**

继续阅读：
- [上下文窗口管理](./15-context-management.md)
- [Token 优化](./16-token-optimization.md)
- [CLAUDE.md 最佳实践](./19-claude-md-patterns.md)
