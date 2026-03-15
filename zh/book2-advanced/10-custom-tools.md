# 第十章：自定义工具

## 什么是"工具"？

Claude Code 有一套内置工具：Read（读文件）、Edit（编辑文件）、Bash（运行命令）、Grep（搜索）等。这些工具让 Claude 能与文件系统和终端交互。

"自定义工具"是对这个工具集的扩展——通过 MCP（Model Context Protocol）协议，你可以让 Claude Code 连接任何外部系统：数据库、API、内部服务、云平台。

**工具 vs Skill 的区别**：

| 特性 | 工具（MCP Tool） | Skill |
|------|----------------|-------|
| 本质 | 外部服务的连接器 | 提示词模板 |
| 实现方式 | 独立的 MCP server | markdown 文件 |
| 能做什么 | 调用任意外部 API | 引导 Claude 行为 |
| 典型用途 | 查询数据库、调用 Slack | 代码审查流程、提交规范 |

---

## MCP 作为工具扩展机制

MCP 是 Anthropic 开发的开放协议，专门用于连接 AI 工具与外部服务。当你安装一个 MCP server，Claude Code 可以直接调用它提供的"工具"。

```
Claude Code ←→ MCP Protocol ←→ MCP Server ←→ 外部服务
                                               (GitHub, Postgres, Slack...)
```

从 Claude 的视角看，MCP 工具和内置工具没有区别：

```
可用工具：
- Read（内置）
- Edit（内置）
- Bash（内置）
- github__create_pr（来自 GitHub MCP server）
- postgres__query（来自 PostgreSQL MCP server）
- slack__send_message（来自 Slack MCP server）
```

---

## 快速添加现有 MCP Server

### 添加 GitHub 工具

```bash
# 添加 GitHub MCP server（使用 HTTP 传输）
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

认证：
```
/mcp
# 选择 github，点击 Authenticate，在浏览器完成登录
```

使用：
```
获取 devstack 项目所有 open 的 PR
为 issue #234 创建 PR，分支名 fix/user-auth-bug
在 PR #456 上发表代码审查评论
```

### 添加 PostgreSQL 工具

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly_user:pass@db.example.com:5432/myapp"
```

使用：
```
查询过去 7 天注册的用户数量
显示 orders 表的 schema
找出最近 24 小时内出现错误的记录
```

### 添加 Sentry 监控工具

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

使用：
```
过去 24 小时最频繁的错误是什么？
显示 error ID abc123 的完整堆栈跟踪
哪个 release 引入了这个新错误？
```

---

## 构建自定义 MCP Server

当现有的 MCP server 不满足需求时，可以构建自己的。

### 工具的概念

每个 MCP server 暴露若干"工具"，每个工具有：
- **名称**：唯一标识符
- **描述**：让 Claude 理解什么时候用这个工具
- **输入 schema**：参数定义（JSON Schema 格式）
- **处理函数**：工具被调用时执行的代码

### 示例：内部服务 MCP Server

假设你有一个内部部署系统，需要让 Claude 能查询部署状态和触发部署。

**项目结构**：
```
deploy-mcp-server/
├── server.py
├── requirements.txt
└── README.md
```

**server.py**：

```python
#!/usr/bin/env python3
"""内部部署系统的 MCP Server"""

import json
import sys
import subprocess
import requests
from typing import Any

# MCP 服务器实现（使用 stdio 传输）
def handle_list_tools():
    """返回可用工具列表"""
    return {
        "tools": [
            {
                "name": "get_deploy_status",
                "description": "查询指定环境的最新部署状态",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "environment": {
                            "type": "string",
                            "enum": ["staging", "production"],
                            "description": "目标环境"
                        }
                    },
                    "required": ["environment"]
                }
            },
            {
                "name": "trigger_deploy",
                "description": "触发指定服务到指定环境的部署",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "service": {
                            "type": "string",
                            "description": "服务名称（如 api-server、frontend）"
                        },
                        "environment": {
                            "type": "string",
                            "enum": ["staging"],  # 生产环境不允许自动触发
                            "description": "目标环境（仅支持 staging）"
                        },
                        "branch": {
                            "type": "string",
                            "description": "要部署的 git 分支",
                            "default": "main"
                        }
                    },
                    "required": ["service", "environment"]
                }
            },
            {
                "name": "get_service_logs",
                "description": "获取服务的最近日志",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "service": {
                            "type": "string",
                            "description": "服务名称"
                        },
                        "lines": {
                            "type": "integer",
                            "description": "返回的日志行数",
                            "default": 100
                        }
                    },
                    "required": ["service"]
                }
            }
        ]
    }


def get_deploy_status(environment: str) -> dict:
    """查询部署状态（实际调用内部 API）"""
    # 替换为你的实际 API
    response = requests.get(
        f"http://deploy.internal/api/status/{environment}",
        headers={"Authorization": f"Bearer {DEPLOY_TOKEN}"},
        timeout=10
    )
    return response.json()


def trigger_deploy(service: str, environment: str, branch: str = "main") -> dict:
    """触发部署"""
    if environment == "production":
        return {"error": "生产环境部署需要通过 CI/CD 流水线，不支持直接触发"}

    response = requests.post(
        "http://deploy.internal/api/deploy",
        json={"service": service, "environment": environment, "branch": branch},
        headers={"Authorization": f"Bearer {DEPLOY_TOKEN}"},
        timeout=30
    )
    return response.json()


def get_service_logs(service: str, lines: int = 100) -> dict:
    """获取服务日志"""
    result = subprocess.run(
        ["kubectl", "logs", f"deployment/{service}", f"--tail={lines}", "-n", "production"],
        capture_output=True, text=True, timeout=30
    )
    return {
        "logs": result.stdout,
        "error": result.stderr if result.returncode != 0 else None
    }


def handle_call_tool(name: str, arguments: dict) -> dict:
    """处理工具调用"""
    if name == "get_deploy_status":
        result = get_deploy_status(arguments["environment"])
    elif name == "trigger_deploy":
        result = trigger_deploy(
            arguments["service"],
            arguments["environment"],
            arguments.get("branch", "main")
        )
    elif name == "get_service_logs":
        result = get_service_logs(
            arguments["service"],
            arguments.get("lines", 100)
        )
    else:
        result = {"error": f"未知工具：{name}"}

    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps(result, ensure_ascii=False, indent=2)
            }
        ]
    }


def main():
    """stdio 传输的主循环"""
    import os
    global DEPLOY_TOKEN
    DEPLOY_TOKEN = os.environ.get("DEPLOY_API_TOKEN", "")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            method = request.get("method")
            request_id = request.get("id")

            if method == "tools/list":
                response = {"result": handle_list_tools()}
            elif method == "tools/call":
                params = request.get("params", {})
                response = {"result": handle_call_tool(
                    params["name"],
                    params.get("arguments", {})
                )}
            else:
                response = {"error": {"code": -32601, "message": "Method not found"}}

            print(json.dumps({"id": request_id, **response}))
            sys.stdout.flush()

        except Exception as e:
            print(json.dumps({
                "id": request.get("id") if 'request' in locals() else None,
                "error": {"code": -32603, "message": str(e)}
            }))
            sys.stdout.flush()


if __name__ == "__main__":
    main()
```

### 注册 Server

```bash
claude mcp add --transport stdio --env DEPLOY_API_TOKEN=your-token deploy \
  -- python /path/to/deploy-mcp-server/server.py
```

### 使用

```
查询 staging 环境的部署状态
把 api-server 的 feature/new-auth 分支部署到 staging
显示 frontend 服务的最近 50 行日志
```

---

## 工具 Schema 设计原则

好的工具 schema 让 Claude 能正确地使用你的工具：

### 原则 1：描述要说"何时用"，不只是"做什么"

```python
# 不好的描述
"description": "查询数据库"

# 好的描述
"description": "查询 PostgreSQL 数据库。当需要分析用户行为、查询订单数据、或获取系统统计时使用。只支持 SELECT 查询。"
```

### 原则 2：参数类型要精确

```python
# 不好的 schema
{
  "environment": {
    "type": "string"
  }
}

# 好的 schema（用 enum 约束有效值）
{
  "environment": {
    "type": "string",
    "enum": ["staging", "production"],
    "description": "目标环境"
  }
}
```

### 原则 3：包含默认值和示例

```python
{
  "lines": {
    "type": "integer",
    "description": "返回的日志行数",
    "default": 100,
    "minimum": 1,
    "maximum": 1000
  }
}
```

---

## 测试自定义工具

### 方法 1：直接测试

```bash
# 启动 server 并手动发送 JSON-RPC 请求
echo '{"id":1,"method":"tools/list"}' | python server.py

# 测试工具调用
echo '{"id":2,"method":"tools/call","params":{"name":"get_deploy_status","arguments":{"environment":"staging"}}}' | python server.py
```

### 方法 2：在 Claude Code 中测试

添加 server 后，在 Claude Code 中测试：

```
/mcp
# 确认 server 连接正常

查询 staging 环境的部署状态
# 如果工具正常，Claude 会调用 get_deploy_status 并返回结果
```

### 方法 3：检查工具可见性

```bash
# 查看 Claude Code 识别到的所有工具
claude mcp list
claude mcp get deploy  # 详细信息
```

---

## 为团队部署工具

### 方案 1：项目 .mcp.json

把工具配置提交到版本控制，团队成员自动获得：

```json
// .mcp.json
{
  "mcpServers": {
    "deploy": {
      "type": "stdio",
      "command": "python",
      "args": ["${CLAUDE_PROJECT_DIR}/.claude/mcp-servers/deploy/server.py"],
      "env": {
        "DEPLOY_API_TOKEN": "${DEPLOY_API_TOKEN}"
      }
    },
    "internal-db": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DB_DSN}"]
    }
  }
}
```

团队成员只需要在 `.env` 中设置各自的 token：
```bash
DEPLOY_API_TOKEN=dev-token-for-alice
DB_DSN=postgresql://alice:pass@localhost:5432/myapp
```

Claude Code 首次遇到 `.mcp.json` 时会提示确认（安全检查），确认后所有 server 自动启动。

### 方案 2：通过 Claude Code 插件分发

把 MCP server 打包成插件，用插件机制分发：

```json
// plugin.json
{
  "name": "devops-tools",
  "version": "1.0.0",
  "mcpServers": {
    "deploy": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/deploy-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  }
}
```

团队成员安装插件后自动获得工具：
```
/plugin install devops-tools
```

---

## MCP Tool Search：处理大量工具

当团队安装了很多 MCP server 时，所有工具的 schema 会占据大量上下文空间。Claude Code 的 MCP Tool Search 解决这个问题：

**工作机制**：
1. 默认情况下，当 MCP 工具超过上下文窗口的 10% 时，自动启用 Tool Search
2. 工具不预加载到上下文，而是按需搜索
3. Claude 使用搜索工具找到需要的 MCP 工具
4. 从用户视角，工具使用完全透明

**对工具开发者的影响**：

在 MCP server 中加入清晰的服务器说明，帮助 Claude 搜索时找到你的工具：

```python
def handle_list_tools():
    return {
        "tools": [...],
        # 服务器说明：告诉 Claude 何时搜索这个 server 的工具
        "serverInstructions": """
这个工具集处理所有与 DevOps 和部署相关的任务：
- 查询部署状态
- 触发部署
- 查看服务日志
当用户询问部署、发布、服务状态相关问题时使用。
        """
    }
```

---

## 本章总结

自定义工具通过 MCP 协议扩展 Claude 的能力边界：

1. **现有 MCP server**：大多数需求已有现成 server（GitHub、数据库、Slack 等）
2. **自建 MCP server**：用 Python 或 TypeScript 实现，暴露内部 API 给 Claude
3. **工具 Schema**：好的描述 + 精确的类型约束 = Claude 正确使用工具
4. **团队部署**：通过 `.mcp.json` 或插件机制，一次配置团队共享

下一章，我们深入 MCP 协议本身——理解 servers、clients、transports 的架构。

---

**下一章：** [MCP 基础](./11-mcp-basics.md)
