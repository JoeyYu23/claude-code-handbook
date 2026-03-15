# 附录 B：MCP Server 清单

> 常用 MCP Server 速查表——安装命令、适用场景、注意事项。

---

## 安装 MCP Server 的通用语法

```bash
# HTTP 远程 server（推荐，最简单）
claude mcp add --transport http <名称> <URL>

# stdio 本地 server
claude mcp add --transport stdio <名称> -- npx -y <包名>

# 带 scope（local/project/user）
claude mcp add --transport http --scope project <名称> <URL>

# 查看已安装的 server
claude mcp list

# 在 session 中查看状态
/mcp
```

---

## 开发工具类

| MCP Server | 功能 | 安装命令 |
|-----------|------|---------|
| **GitHub** | PR 管理、Issue、代码审查 | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` |
| **GitLab** | GitLab 仓库操作 | 参见 GitLab 文档 |
| **Sentry** | 错误监控和调试 | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` |
| **Playwright** | 浏览器自动化 / E2E 测试 | `claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest` |

---

## 数据库类

| MCP Server | 支持的数据库 | 安装命令 |
|-----------|------------|---------|
| **DBHub** | PostgreSQL, MySQL, SQLite, SQL Server | `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "<DSN>"` |
| **PostgreSQL (官方)** | PostgreSQL | `claude mcp add --transport stdio postgres -- npx -y @modelcontextprotocol/server-postgres --connection-string "<DSN>"` |
| **Redis** | Redis | `claude mcp add --transport stdio redis -- npx -y @modelcontextprotocol/server-redis --url "redis://localhost:6379"` |
| **SQLite (官方)** | SQLite | `claude mcp add --transport stdio sqlite -- npx -y @modelcontextprotocol/server-sqlite --db-path "./data.db"` |

---

## 生产力类

| MCP Server | 功能 | 安装命令 |
|-----------|------|---------|
| **Notion** | Notion 页面和数据库 | `claude mcp add --transport http notion https://mcp.notion.com/mcp` |
| **Slack** | 消息和频道 | `claude mcp add --transport http slack https://mcp.slack.com/mcp` |
| **Jira** | Issue 追踪 | 参见 Atlassian 文档 |
| **Asana** | 任务管理 | `claude mcp add --transport sse asana https://mcp.asana.com/sse` |
| **Linear** | 工程任务追踪 | `claude mcp add --transport http linear https://mcp.linear.app/mcp` |
| **Google Drive** | 文档和文件 | 参见 Google 文档 |

---

## 云服务类

| MCP Server | 功能 | 安装命令 |
|-----------|------|---------|
| **AWS** | AWS 资源管理 | `claude mcp add --transport stdio aws -- npx -y @modelcontextprotocol/server-aws` |
| **Stripe** | 支付数据查询 | `claude mcp add --transport http stripe https://mcp.stripe.com` |
| **Cloudflare** | CDN/Workers 管理 | `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/sse` |
| **Vercel** | 部署和项目管理 | 参见 Vercel 文档 |

---

## 本地工具类

| MCP Server | 功能 | 安装命令 |
|-----------|------|---------|
| **Filesystem (官方)** | 扩展文件系统访问权限 | `claude mcp add --transport stdio files -- npx -y @modelcontextprotocol/server-filesystem /path/to/dir` |
| **Fetch (官方)** | 网页内容抓取 | `claude mcp add --transport stdio fetch -- npx -y @modelcontextprotocol/server-fetch` |
| **Memory (官方)** | 持久化键值存储 | `claude mcp add --transport stdio memory -- npx -y @modelcontextprotocol/server-memory` |
| **Git (官方)** | Git 仓库操作 | `claude mcp add --transport stdio git -- npx -y @modelcontextprotocol/server-git --repository /path/to/repo` |

---

## 数据分析类

| MCP Server | 功能 | 安装命令 |
|-----------|------|---------|
| **Excel/CSV** | 电子表格操作 | `claude mcp add --transport stdio excel -- npx -y @modelcontextprotocol/server-excel` |
| **Pandas** | Python 数据分析 | 自建（见第十四章） |
| **Metabase** | BI 数据查询 | 参见 Metabase 文档 |

---

## 安全使用 MCP Server 的原则

```
安装前确认：
□ MCP server 来自知名组织或有良好 GitHub 记录
□ 明确了解该 server 会访问哪些数据
□ 生产环境敏感服务使用只读权限

配置时注意：
□ API keys 通过 --env 传入，不硬编码在命令中
□ 生产 DB 连接只给读权限
□ 将 project-scope 的 .mcp.json 提交到 Git 前，团队一起 review

定期维护：
□ 检查并更新 MCP server 版本
□ 移除不再使用的 server（claude mcp remove <名称>）
□ 定期轮换 MCP server 使用的 API keys
```

---

## 自建 MCP Server 快速参考

详细教程见[第十四章：自建 MCP Server](./14-custom-mcp.md)。

```bash
# 1. 初始化项目
npm init -y && npm install @modelcontextprotocol/sdk zod

# 2. 创建 server（最小模板）
cat > server.js << 'EOF'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool("hello", "Say hello", { name: z.string() }, async ({ name }) => ({
  content: [{ type: "text", text: `Hello, ${name}!` }]
}));

await server.connect(new StdioServerTransport());
EOF

# 3. 注册
claude mcp add --transport stdio my-server -- node server.js
```

---

## 更多 MCP Server 资源

- **官方 MCP Server 列表**：`github.com/modelcontextprotocol/servers`
- **Anthropic MCP Registry**：`api.anthropic.com/mcp-registry/v0/servers`
- **MCP 文档**：`modelcontextprotocol.io`
- **Claude Code MCP 文档**：`code.claude.com/docs/en/mcp`
