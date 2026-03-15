# 第十四章：自建 MCP Server

> 构建你自己的 MCP Server，把任何 API、服务或内部工具接入 Claude Code。

---

## 为什么要自建 MCP Server？

公开的 MCP Server 生态在快速扩张，但总有一些场景它们覆盖不到：
- 公司内部的专有 API
- 特定业务逻辑的自动化工具
- 与公司遗留系统的集成
- 个人工作流专属工具

自建 MCP Server 让你把任何东西都变成 Claude Code 可以调用的工具。

---

## MCP Server 架构

一个 MCP Server 由三类组件构成：

```
MCP Server
├── Tools      # Claude 可以调用的操作（函数）
├── Resources  # Claude 可以读取的数据（文件、API 数据等）
└── Prompts    # 预设的提示模板（以 /mcp__server__prompt 形式暴露）
```

**Transport 层**连接 MCP Server 与 Claude Code：
- **stdio**：通过标准输入输出通信，适合本地工具
- **HTTP (Streamable HTTP)**：通过 HTTP 通信，适合远程服务、云部署

---

## TypeScript SDK 实战

### 环境准备

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
```

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### 最小可运行示例

`src/server.ts`：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建 server 实例
const server = new McpServer({
  name: "my-tools",
  version: "1.0.0",
});

// 定义一个工具：计算两数之和
server.tool(
  "add_numbers",                          // 工具名
  "Add two numbers together",             // 描述（Claude 用来判断何时调用）
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

// 启动 stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 注册到 Claude Code

```bash
# 编译
npx tsc

# 注册（stdio 模式）
claude mcp add --transport stdio my-tools \
  -- node /path/to/my-mcp-server/dist/server.js

# 验证
claude mcp get my-tools
```

---

## 定义 Tools

Tools 是 MCP Server 最核心的组件，代表 Claude 可以执行的操作。

### 真实业务工具示例：内部部署系统

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEPLOY_API = process.env.DEPLOY_API_URL!;
const DEPLOY_TOKEN = process.env.DEPLOY_API_TOKEN!;

const server = new McpServer({
  name: "deploy-tools",
  version: "1.0.0",
});

// 工具一：列出可部署的服务
server.tool(
  "list_services",
  "List all services available for deployment",
  {},
  async () => {
    const res = await fetch(`${DEPLOY_API}/services`, {
      headers: { Authorization: `Bearer ${DEPLOY_TOKEN}` },
    });
    const services = await res.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(services, null, 2),
      }],
    };
  }
);

// 工具二：触发部署
server.tool(
  "deploy_service",
  "Deploy a specific service to an environment",
  {
    service: z.string().describe("Service name"),
    environment: z.enum(["staging", "production"]).describe("Target environment"),
    version: z.string().optional().describe("Version tag, defaults to latest"),
  },
  async ({ service, environment, version }) => {
    // 生产环境需要额外确认（通过返回提示让 Claude 询问用户）
    if (environment === "production") {
      return {
        content: [{
          type: "text",
          text: `WARNING: About to deploy ${service}@${version ?? "latest"} to PRODUCTION. Please confirm this is intentional.`,
        }],
        isError: false,
      };
    }

    const res = await fetch(`${DEPLOY_API}/deploy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEPLOY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ service, environment, version }),
    });

    const result = await res.json();
    return {
      content: [{
        type: "text",
        text: `Deploy initiated. Job ID: ${result.jobId}. Track at: ${result.trackUrl}`,
      }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 定义 Resources

Resources 让 Claude 可以读取数据（类似文件），而不是执行操作：

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// 静态 resource：项目的 API 文档
server.resource(
  "api-docs",
  "docs://api",
  { mimeType: "text/markdown" },
  async () => ({
    contents: [{
      uri: "docs://api",
      text: await fs.readFile("./docs/api.md", "utf-8"),
    }],
  })
);

// 动态 resource：通过模板 URI 按 ID 获取内容
server.resource(
  "ticket",
  new ResourceTemplate("jira://ticket/{ticketId}", { list: undefined }),
  { mimeType: "application/json" },
  async (uri, { ticketId }) => {
    const ticket = await fetchJiraTicket(ticketId as string);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(ticket, null, 2),
      }],
    };
  }
);
```

在 Claude Code 中使用 `@` 语法引用 resource：

```
> 看一下 @jira://ticket/ENG-4521 的需求，帮我写对应的实现代码
```

---

## 定义 Prompts

Prompts 是预设的提示模板，在 Claude Code 中变成 `/mcp__server__prompt` 命令：

```typescript
server.prompt(
  "code_review",
  "Perform a structured code review",
  {
    pr_url: z.string().describe("Pull request URL"),
    focus: z.enum(["security", "performance", "style", "all"])
      .default("all")
      .describe("Review focus area"),
  },
  async ({ pr_url, focus }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review the pull request at ${pr_url}.
Focus on: ${focus}

Review criteria:
- Security: Check for injection vulnerabilities, exposed secrets, auth issues
- Performance: Identify N+1 queries, missing indexes, inefficient algorithms
- Style: Verify naming conventions, code organization, documentation

Provide: summary, issues found (severity: high/medium/low), and suggestions.`,
      },
    }],
  })
);
```

使用：

```
/mcp__deploy-tools__code_review https://github.com/org/repo/pull/123 security
```

---

## Transport 选项

### stdio（本地工具推荐）

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

适用场景：本地开发工具、内部脚本、需要访问本机文件系统的工具。

### HTTP (Streamable HTTP)（远程服务推荐）

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, () => {
  console.log("MCP server running on http://localhost:3000/mcp");
});
```

注册远程 server：

```bash
claude mcp add --transport http my-remote-tools http://my-server.com:3000/mcp
```

---

## 测试和调试

### 单元测试

```typescript
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

describe("my-mcp-server", () => {
  it("add_numbers tool works correctly", async () => {
    // 创建 client-server 对并直接连接（不经过网络）
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const client = new Client({ name: "test-client", version: "1.0" }, {});
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "add_numbers",
      arguments: { a: 3, b: 4 },
    });

    expect(result.content[0].text).toBe("7");
  });
});
```

### 用 MCP Inspector 调试

MCP 官方提供了交互式调试工具：

```bash
# 安装
npm install -g @modelcontextprotocol/inspector

# 调试你的 server
mcp-inspector node dist/server.js
```

打开 `http://localhost:5173`，可以图形化地测试所有工具、resource 和 prompt。

---

## 部署和分发

### 发布为 npm 包

```json
// package.json
{
  "name": "@your-org/mcp-server-deploy",
  "version": "1.0.0",
  "main": "dist/server.js",
  "bin": {
    "mcp-server-deploy": "dist/server.js"
  }
}
```

用户安装后：

```bash
claude mcp add --transport stdio deploy \
  -- npx -y @your-org/mcp-server-deploy
```

### 共享给团队（project scope）

```bash
# 添加为项目级 server，会写入 .mcp.json
claude mcp add --transport stdio deploy --scope project \
  -- node ./tools/mcp-server/dist/server.js
```

`.mcp.json` 提交到 Git，团队成员 `git pull` 后自动有该工具。

---

**下一章：** [上下文窗口管理](./15-context-management.md)
