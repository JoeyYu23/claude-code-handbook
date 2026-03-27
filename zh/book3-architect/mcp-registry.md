# 附录 B：MCP 服务器目录

Claude Code 常用 MCP 服务器的精选参考列表。如需查看完整的实时目录，可运行 `claude mcp add` 浏览，或访问 [MCP 服务器注册表](https://github.com/modelcontextprotocol/servers)。

---

## 开发工具

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **GitHub** | 读写 issue、PR、仓库、代码审查。 | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | 自动化 PR 创建、issue 分类、代码审查 |
| **GitLab** | 管理 GitLab issue、MR、流水线。 | `claude mcp add --transport stdio gitlab -- npx -y @gitbeaker/mcp` | GitLab 团队；CI/CD 集成 |
| **Sentry** | 查询错误事件、堆栈追踪、发布版本。 | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | 调试生产错误；追踪错误来源 |
| **Playwright** | 浏览器自动化、截图、表单填写、JS 执行。 | `claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest` | E2E 测试、UI 验证、视觉回归 |
| **Browserbase** | 带 session 管理的云端浏览器自动化。 | 见 [browserbase.com/docs](https://docs.browserbase.com) | 大规模爬取、自动化浏览器测试 |
| **Nx** | Monorepo 依赖图分析、受影响项目检测。 | `claude mcp add --transport stdio nx -- npx -y @nx/mcp` | 大型 monorepo 工作流、依赖分析 |

---

## 数据库

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **DBHub（PostgreSQL/MySQL/SQLite）** | 查询任意 SQL 数据库、探索 schema、分析数据。 | `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://user:pass@host/db"` | 通用 SQL 数据库访问 |
| **Postgres（官方）** | PostgreSQL 专用，将 schema 作为资源暴露。 | `claude mcp add --transport stdio postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://user:pass@host/db` | PostgreSQL schema 探索 |
| **MongoDB** | MongoDB 查询、聚合、集合管理。 | `claude mcp add --transport stdio mongo -- npx -y @mongodb-js/mcp-server-mongodb` | 文档数据库访问 |
| **Supabase** | Supabase 数据库、认证、存储、边缘函数。 | `claude mcp add --transport http supabase https://mcp.supabase.com` | Supabase 项目 |
| **Neon** | 支持分支的 Neon Serverless Postgres。 | 见 [neon.tech/docs](https://neon.tech/docs/ai/mcp) | Serverless Postgres 开发 |
| **Turso** | 边缘端 LibSQL/SQLite。 | 见 [turso.tech](https://turso.tech) | 边缘数据库访问 |

---

## 云服务商

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **AWS** | 查询 AWS 服务、管理资源、读取 CloudWatch 日志。 | `claude mcp add --transport stdio aws -- npx -y @aws/mcp-server-aws` | AWS 基础设施管理 |
| **Cloudflare** | 管理 Workers、KV、R2、D1、Pages。 | `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/sse` | 基于 Cloudflare 的部署 |
| **Vercel** | 部署、管理项目、读取日志、环境变量。 | `claude mcp add --transport http vercel https://mcp.vercel.com/sse` | Vercel 部署管理 |
| **Fly.io** | 管理 Fly 上的应用、密钥、部署。 | 见 [fly.io/docs](https://fly.io/docs) | Fly.io 部署 |
| **GCP** | Google Cloud 资源管理。 | `claude mcp add --transport stdio gcp -- npx -y @google-cloud/mcp-server` | GCP 基础设施 |

---

## 项目管理

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Linear** | 读写 Linear issue、项目、迭代周期。 | `claude mcp add --transport http linear https://mcp.linear.app/mcp` | 基于 Linear 的团队工作流 |
| **Jira** | 读写 Jira issue、Sprint、看板。 | `claude mcp add --transport http jira https://mcp.atlassian.com/rest/mcp/sse` | Atlassian Jira 工作流 |
| **Asana** | 读写 Asana 任务、项目、团队。 | `claude mcp add --transport sse asana https://mcp.asana.com/sse` | Asana 任务管理 |
| **Notion** | 读写 Notion 页面、数据库、块。 | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | 基于 Notion 的文档/项目管理 |
| **GitHub Projects** | GitHub 项目看板与 issue（通过 GitHub MCP）。 | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | 基于 GitHub Projects 的工作流 |
| **Shortcut** | 读写 Shortcut 故事、史诗、Sprint。 | 见 [shortcut.com](https://shortcut.com) | 使用 Shortcut 的团队 |

---

## 通讯协作

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Slack** | 读取频道、发布消息、搜索对话。 | `claude mcp add --transport http slack https://mcp.slack.com/mcp` | 基于 Slack 的团队沟通 |
| **Gmail** | 读取、发送和管理 Gmail 邮件。 | `claude mcp add --transport http gmail https://mcp.gmail.com` | 邮件自动化、摘要生成 |
| **Google Calendar** | 读写日历事件、检查可用时间。 | 见 [Google MCP 文档](https://developers.google.com/workspace/mcp) | 日程自动化 |
| **SendGrid** | 发送事务性邮件、管理模板。 | `claude mcp add --transport stdio sendgrid -- npx -y @sendgrid/mcp` | 应用内邮件集成 |

---

## 效率与知识管理

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Google Drive** | 读写 Google Docs、Sheets、Slides、Drive 文件。 | `claude mcp add --transport stdio gdrive -- npx -y @modelcontextprotocol/server-gdrive` | 文档与规格说明访问 |
| **Obsidian** | 读写 Obsidian 知识库笔记。 | `claude mcp add --transport stdio obsidian -- npx -y mcp-obsidian --vault /path/to/vault` | 个人知识库访问 |
| **Confluence** | 读写 Confluence 页面和空间。 | `claude mcp add --transport http confluence https://mcp.atlassian.com/rest/mcp/sse` | Atlassian 文档 |
| **Figma** | 访问 Figma 设计、组件、评论。 | `claude mcp add --transport http figma https://mcp.figma.com/sse` | 设计转代码工作流 |

---

## 支付与商业

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Stripe** | 查询交易、客户、发票、订阅。 | `claude mcp add --transport http stripe https://mcp.stripe.com` | 支付与账单集成 |
| **PayPal** | 查询订单、付款、订阅。 | `claude mcp add --transport http paypal https://mcp.paypal.com/mcp` | PayPal 集成 |
| **HubSpot** | CRM 联系人、商机、公司、活动。 | `claude mcp add --transport http hubspot https://mcp.hubspot.com/anthropic` | 基于 CRM 的开发 |
| **Salesforce** | 查询 SFDC 对象、报表、自定义对象。 | 见 [Salesforce MCP](https://developer.salesforce.com/mcp) | Salesforce 集成 |

---

## 文件系统与存储

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Filesystem** | 在可配置范围内读写文件。 | `claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem /path/to/dir` | 访问工作目录之外的受控文件 |
| **AWS S3** | 读写 S3 存储桶和对象。 | `claude mcp add --transport stdio s3 -- npx -y @aws/mcp-server-aws-s3` | S3 对象管理 |
| **Google Cloud Storage** | 读写 GCS 存储桶和对象。 | 见 [GCP MCP 文档](https://cloud.google.com/mcp) | GCS 存储集成 |

---

## 可观测性与监控

| 服务器 | 功能 | 安装命令 | 使用场景 |
|--------|------|----------|---------|
| **Sentry** | 错误事件、堆栈追踪、发布版本跟踪。 | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | 生产错误排查 |
| **Datadog** | 指标、日志、链路追踪、监控器、仪表盘。 | 见 [Datadog MCP](https://docs.datadoghq.com/integrations/mcp/) | 完整可观测性栈 |
| **Grafana** | 查询仪表盘、探索指标和日志。 | `claude mcp add --transport http grafana https://mcp.grafana.com` | 指标驱动的调试 |
| **PagerDuty** | 读取事件、升级策略、值班排班。 | 见 [PagerDuty MCP](https://developer.pagerduty.com/mcp) | 事故响应工作流 |

---

## 作用域选择快速参考

```bash
# 本地（默认）— 仅对你在此项目中可见
claude mcp add --scope local ...

# 项目 — 通过 .mcp.json 与团队共享（切勿包含凭证）
claude mcp add --scope project ...

# 用户 — 在你所有项目中均可用
claude mcp add --scope user ...
```

**经验法则：**
- 包含凭证的配置 → `local`
- 整个团队共用的工具 → `project`（凭证通过环境变量传递，不写入配置）
- 你个人到处都用的工具 → `user`

---

## MCP 服务器安全检查清单

添加任何 MCP 服务器前，请确认以下事项：

```
安装前：
☐ 服务器来自已知组织，或有可验证的开源代码
☐ 已了解该服务器能读取或修改哪些数据
☐ 生产/敏感连接使用只读凭证

配置时：
☐ 凭证通过 --env 参数传递，不硬编码在命令中
☐ 数据库连接使用专用的最小权限用户
☐ 项目范围的 .mcp.json 在提交前经团队审查

持续维护：
☐ 定期更新 MCP 服务器包
☐ 删除不再使用的服务器：`claude mcp remove <name>`
☐ 每季度轮换 MCP 服务器使用的 API 密钥
```

---

## 从 Claude Desktop 导入

如果你已在 Claude Desktop 中配置了 MCP 服务器，可将其导入 Claude Code：

```bash
claude mcp add-from-claude-desktop
```

交互式选择要导入的服务器。支持 macOS 和 WSL。

---

## 自行构建

当没有现成服务器满足需求时，可以构建自定义 MCP 服务器。详见《Book 2》[第 14 章 — 构建自定义 MCP 服务器](/zh/book2-advanced/14-custom-mcp)。

**快速入门模板：**

```bash
# 1. 初始化项目
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod

# 2. 创建 server.js
cat > server.js << 'EOF'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool(
  "my_tool",
  "Description of what this tool does",
  { input: z.string().describe("The input parameter") },
  async ({ input }) => ({
    content: [{ type: "text", text: `Processed: ${input}` }]
  })
);

await server.connect(new StdioServerTransport());
EOF

# 3. 注册到 Claude Code
claude mcp add --transport stdio my-server -- node server.js
```

社区 MCP 服务器：[github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
