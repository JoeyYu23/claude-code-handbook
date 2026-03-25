# 第十一章：MCP 基础

Model Context Protocol 是近几年 AI 工具领域最重要的思想之一。对于任何想充分发挥 Claude Code 能力的人来说，理解它不是可选项——它是所有外部集成的基础。

---

## MCP 解决的问题

在 MCP 出现之前，每个 AI 工具都有自己的专有集成系统。想让 Claude 查询你的数据库？写一套自定义集成。想让 GPT-4 访问你的 Jira？另一套自定义集成。想切换 AI 供应商？重写所有集成。

结果是一个 M×N 问题：M 个 AI 模型乘以 N 个工具，等于需要构建和维护的 M×N 套自定义集成。每个工具提供商必须为每个 AI 提供商写单独的代码，反之亦然。

MCP 是解决方案。它定义了一套任何 AI 模型都能使用、任何工具都能实现的标准接口。把你的工具写一次，任何支持 MCP 的 AI 都能用它。切换 AI 供应商，你的工具仍然有效。

这类似于 HTTP 解决早期网络协议碎片化的方式，或者 USB 解决专有连接器泛滥的方式。标准接口创造了生态系统。

---

## MCP 的本质

MCP 是一个包含三层的客户端-服务器协议：

**协议层：** 消息格式（JSON-RPC 2.0）和生命周期事件（初始化、能力协商、工具调用、响应）。

**传输层：** 消息的物理发送方式。目前有：stdio（通过 stdin/stdout 通信的本地进程）和 HTTP with streaming（通过 HTTP 通信的远程服务器）。

**能力层：** 服务器可以暴露的具体能力——工具、资源和提示词。

Claude Code 连接 MCP server 时：
1. 通过传输（stdio 或 HTTP）建立连接
2. 协商能力（哪些工具/资源/提示词可用）
3. 将工具定义加载到上下文中
4. 随时可以调用这些工具

---

## MCP 架构：Servers、Clients 和 Transports

术语可能令人困惑，这里是精确的含义：

**MCP Server：** 暴露工具、资源或提示词的程序。这里的"server"意思是"服务提供者"——它服务于 Claude 对工具执行的请求。你的数据库查询工具就是一个 MCP server。

**MCP Client：** AI 模型一侧。Claude Code 是 MCP client——它消费 servers 提供的工具。当 Claude Code 调用你的数据库查询工具时，它扮演的是 client 角色。

**Host application：** 运行 MCP client 的应用程序。在 Claude Code 中，host 就是 Claude Code 本身。

如果你把"server"理解为"大型机器"、"client"理解为"你的笔记本"，这个命名可能感觉反过来了。在 MCP 中，你的自定义工具作为"server"运行，即使它只是你本地机器上的一个小脚本。把它理解为"server = 被从中提供服务的东西"，而不是"server = 大型机器"。

### 传输类型

**stdio 传输：** 用于以子进程方式运行的本地工具。Claude Code 启动工具进程，通过 stdin/stdout 通信，完成后终止它。

```json
{
  "type": "stdio",
  "command": "node",
  "args": ["/path/to/tool/index.js"],
  "env": {
    "API_KEY": "your-key"
  }
}
```

**HTTP 传输（Streamable HTTP）：** 用于远程 server。Claude Code 连接到一个 URL，通过带流式响应的 HTTP POST 通信。

```json
{
  "type": "http",
  "url": "https://mcp.notion.com/mcp",
  "headers": {
    "Authorization": "Bearer ${NOTION_API_KEY}"
  }
}
```

旧的 SSE（Server-Sent Events）传输已被弃用，建议迁移到 HTTP。如果遇到 SSE URL，它们仍然有效，但应尽可能迁移到 HTTP。

---

## Claude Code 通过 MCP 暴露的能力

Claude Code 既是 MCP client（它使用 MCP servers），也是 MCP server（其他应用程序可以通过 MCP 使用它）。

将 Claude Code 作为 MCP server 运行：

```bash
claude mcp serve
```

这会将 Claude Code 的内置工具暴露给任何 MCP client。你可以从其他应用程序使用 Claude Code 的文件编辑、bash 执行和搜索能力。

这对于构建需要将 Claude Code 的代码库操作能力作为更大系统组件的自定义工作流特别有用。

---

## MCP 的三种能力

### 工具

工具是 Claude 可以调用的函数，是主要能力。每个工具有：

- **名称：** 唯一标识符（如 `create_issue`、`query_database`）
- **描述：** Claude 读取此内容决定何时使用该工具
- **输入 schema：** 定义参数及其类型的 JSON Schema
- **实现：** 被调用时执行的函数

Claude Code 显示所有已连接 server 的所有可用工具。当你要求 Claude "创建一个 Jira 工单"时，Claude 看到你的 Jira MCP server 的 `create_jira_issue` 工具并使用它。

### 资源

资源是具有 URI 标识符的数据源。与工具（Claude 主动调用）不同，资源是 Claude 可以读取的数据。

示例：
- `file:///home/user/notes/meeting-notes.md`
- `db://production/users/12345`
- `github://anthropics/claude-code/issues/456`

在 Claude Code 中，用 `@` 符号引用资源：

```text
能帮我分析 @postgres:schema://users 的 schema，并与 @github:issue://123 的 API 约定做对比吗？
```

资源可以是 server 暴露的任何东西。文档 MCP server 可能将每个文档页面作为资源暴露；数据库 server 可能将每张表作为资源暴露。

### 提示词

提示词是 MCP servers 作为 `/` 命令暴露的预定义模板。当 server 定义了名为 `review_pr` 的提示词时，它在 Claude Code 中以 `/mcp__servername__review_pr` 形式出现。

```text
/mcp__github__review_pr 456
/mcp__jira__create_issue "Bug: 移动端登录失败" high
```

这对于标准化团队与常见工作流的交互方式很有用。GitHub MCP server 的 `review_pr` 提示词始终使用相同的审查标准，无论谁在运行它。

---

## 安装 MCP Servers

### 方式一：远程 HTTP Servers（推荐）

适用于云服务和团队共享工具：

```bash
# 基本 HTTP server
claude mcp add --transport http notion https://mcp.notion.com/mcp

# 带认证头
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 明确指定 scope（project = 存储在 .mcp.json，与团队共享）
claude mcp add --transport http github --scope project https://api.githubcopilot.com/mcp/
```

### 方式二：本地 stdio Servers

适用于需要访问本地系统的工具：

```bash
# -- 将 server 名称与要运行的命令分开
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem /home/user/projects

# 带环境变量
claude mcp add --transport stdio postgres --env PGPASSWORD=secret -- npx -y @bytebase/dbhub --dsn "postgresql://user@localhost/mydb"
```

### 方式三：从 Claude Desktop 导入

如果你已经在 Claude 桌面应用中配置了 MCP servers：

```bash
claude mcp add-from-claude-desktop
```

交互式选择器让你选择要导入哪些 server。

### 方式四：从 Claude.ai 同步

使用 Claude.ai 账号登录 Claude Code 后，在 claude.ai 中配置的 MCP server 会自动同步到 Claude Code。

### 管理 Servers

```bash
# 列出所有已配置的 server
claude mcp list

# 获取特定 server 的详情
claude mcp get github

# 删除 server
claude mcp remove github

# 在 session 中检查状态
/mcp
```

---

## Scope 和配置文件

MCP server 可以在多个 scope 中配置。理解 scope 对于团队协作很重要。

完整的 scope 优先级从高到低：

| Scope | 指定方式 | 存储位置 |
|---|---|---|
| CLI 标志 | `--mcp-config <path>` | 指定的 JSON 文件 |
| Local（默认） | 默认 | `~/.claude.json`（项目路径下）|
| Project（嵌套） | `.claude/.mcp.json` | 嵌套在 `.claude` 目录中 |
| Project（根目录）| `.mcp.json` | 项目根目录 |
| User | `--scope user` | `~/.claude.json`（全局条目）|
| Plugin | 插件定义 | 插件的配置 |

**Local scope（默认）：** 存储在 `~/.claude.json` 的项目路径下。只有你在此项目中工作时才能看到该 server。用于个人凭证或实验性 server。

```bash
claude mcp add --transport http my-test-server https://localhost:8080/mcp
# 存储在 ~/.claude.json，对你私有
```

**Project scope：** 存储在项目根目录的 `.mcp.json` 中（或 `.claude/.mcp.json`）。提交到版本控制。团队所有成员在该项目工作时都能获得此 server。

```bash
claude mcp add --transport http shared-tool --scope project https://tools.company.com/mcp
# 创建/更新 .mcp.json，提交到 git
```

**User scope：** 存储在 `~/.claude.json` 中作为全局条目，不绑定到某个项目。在所有项目中可用。

```bash
claude mcp add --transport http my-utility --scope user https://my-personal-mcp.dev/mcp
# 在你工作的每个项目中都可用
```

### 优先级

当同一 server 名称出现在多个 scope 时，高优先级 scope 获胜。CLI 的 `--mcp-config` 标志具有最高优先级，允许你为单次调用完全覆盖所有其他 MCP 配置。

### `.mcp.json` 格式

使用 `--scope project` 时，Claude Code 在项目根目录创建或更新 `.mcp.json`：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"]
    }
  }
}
```

注意 `${DATABASE_URL}` — Claude Code 支持 `.mcp.json` 中的环境变量展开。敏感值留在环境变量中；配置文件可以安全提交。

---

## 认证

许多远程 MCP server 需要认证。Claude Code 支持多种机制：

**Header 中的 Bearer token：**

```bash
claude mcp add --transport http api-server https://api.example.com/mcp \
  --header "Authorization: Bearer ${API_TOKEN}"
```

**OAuth 2.0（适用于 GitHub、Notion 等服务）：**

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
# 然后认证：
/mcp
# 选择 github 旁边的 "Authenticate"，跟随浏览器流程
```

OAuth token 安全存储（macOS Keychain 或等效机制）并自动刷新。

**固定 OAuth 回调端口（用于预注册的重定向 URI）：**

```bash
claude mcp add --transport http my-oauth-server --callback-port 8080 \
  https://auth.example.com/mcp
```

---

## MCP 工具搜索

当你配置了很多 MCP server 时，它们的工具描述可能占用大量上下文窗口。Claude Code 通过 MCP Tool Search 自动处理这个问题。

当 MCP 工具会占用超过 10% 的上下文窗口时，Claude Code 切换到按需加载：不是预先加载所有工具描述，而是在需要时用搜索工具找到相关的 MCP 工具。

从你的角度来看，这是无感知的——Claude 仍然正确使用 MCP 工具。但这意味着你可以配置数十个 MCP server，而不会降低大型任务的上下文质量。

用 `ENABLE_TOOL_SEARCH` 环境变量控制此行为：

```bash
# 始终使用工具搜索
ENABLE_TOOL_SEARCH=true claude

# 以自定义阈值使用工具搜索（5% 而非 10%）
ENABLE_TOOL_SEARCH=auto:5 claude

# 禁用工具搜索，始终加载所有工具
ENABLE_TOOL_SEARCH=false claude
```

---

## MCP Elicitation

MCP Elicitation 是一个协议特性，允许 MCP server 在任务执行中途向用户请求结构化输入。与其硬编码配置或在缺乏信息时失败，server 可以暂停并请求 Claude Code 收集一条特定数据。

当 MCP server 发送 elicitation 请求时，Claude Code 会弹出对话框询问用户所需的输入。常见用途包括：

- 首次使用时请求数据库凭证
- 在破坏性操作前请求确认
- 收集 server 无法从上下文推断的参数

从你的角度来看，这看起来像一个普通的权限或输入提示。区别在于是 MCP server 在请求它，而不是 Claude Code 本身。

你可以使用 `Elicitation` hook 事件自动化 elicitation 响应（见第八章）。例如，自动提供存储在环境变量中的数据库密码：

```bash
#!/bin/bash
# .claude/hooks/auto-elicit.sh
INPUT=$(cat)
FIELD=$(echo "$INPUT" | jq -r '.elicitation.field // empty')

if [ "$FIELD" = "db_password" ]; then
  jq -n --arg val "$DB_PASSWORD" '{
    hookSpecificOutput: {
      hookEventName: "Elicitation",
      response: { "db_password": $val }
    }
  }'
fi
exit 0
```

---

## MCP Channels（研究预览）

MCP Channels 是一个研究预览特性，使 MCP server 能够主动向 Claude 推送消息，而不仅仅是响应 Claude 的请求。这颠倒了正常的请求-响应流程。

通过 Channels，MCP server 可以：
- 在监控条件发生时提醒 Claude（CI 构建失败、错误率飙升）
- 将实时数据流入对话（实时日志跟踪、市场数据流）
- 代表用户在 Claude 上发起新任务

Channels 按 server 配置，需要 server 在其 MCP 实现中实现 channels 能力。此特性目前处于研究预览阶段，API 可能会变更。

---

## 值得安装的流行 MCP Servers

以下是一些涵盖常见开发者需求的高质量 MCP server：

| Server | 提供什么 | 安装命令 |
|---|---|---|
| GitHub | 仓库、PR、issue、代码审查 | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` |
| Notion | 页面、数据库、搜索 | `claude mcp add --transport http notion https://mcp.notion.com/mcp` |
| Sentry | 错误追踪、堆栈跟踪 | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` |
| PostgreSQL | SQL 查询、schema | `claude mcp add --transport stdio postgres -- npx -y @bytebase/dbhub --dsn "...conn..."` |
| Playwright | 浏览器自动化 | `claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest` |
| Filesystem | 扩展文件访问 | `claude mcp add --transport stdio files -- npx -y @modelcontextprotocol/server-filesystem /path` |
| Memory | 跨 session 知识图谱 | `claude mcp add --transport stdio memory -- npx -y @modelcontextprotocol/server-memory` |

在 [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) 和 Anthropic MCP 注册表可以找到数百个更多 server。

---

## 企业和团队使用的 MCP

对于需要标准化工具访问的组织：

**托管 MCP 配置** 让 IT 管理员为所有员工的机器系统级部署 MCP server。用户无法添加或删除 server——管理员控制完整配置：

```json
// /Library/Application Support/ClaudeCode/managed-mcp.json (macOS)
// /etc/claude-code/managed-mcp.json (Linux)
{
  "mcpServers": {
    "company-jira": {
      "type": "http",
      "url": "https://jira.company.com/mcp"
    },
    "company-github": {
      "type": "http",
      "url": "https://github.company.com/api/mcp"
    }
  }
}
```

**基于策略的白名单** 让用户添加自己的 server，但限制哪些是允许的：

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://*.company.com/*" },
    { "serverCommand": ["npx", "-y", "@approved/server"] }
  ]
}
```

这种方式在给团队灵活性的同时，防止员工连接到未经授权或潜在恶意的 MCP server。

---

## 理解 MCP 在 Claude Code 中的角色

MCP 不是 Claude Code 的一个特性——它是使 Claude Code 可扩展的集成架构。Claude Code 能使用的每一个外部工具、能查询的每一个数据库、能交互的每一个第三方服务——所有这些都是 MCP 连接。

内置工具（Read、Edit、Bash、Glob、Grep）是 Claude Code 处理本地文件和命令的核心能力。MCP 是你将 Claude 扩展到更广泛技术生态系统的方式。

一个配置了正确 MCP server 的 Claude Code 设置，在质量上比仅有内置工具的 Claude Code 更强大。"Claude 能读文件"与"Claude 能读文件、查询你的数据库、检查你的错误追踪器、更新你的任务追踪器、搜索你的文档"之间的区别，完全取决于 MCP 配置。

---

**本章结束第四部分。** 接下来的章节涵盖上下文管理、token 优化、内存架构和实际团队工作流。

---

**下一章：** [第十二章——Browser MCP](./12-browser-mcp.md) — 网页浏览、Playwright 自动化和爬取模式。
