# 第二十章：插件与市场

## 什么是插件？

插件是一捆扩展功能，为 Claude Code 添加新能力。插件包含：

- **Skill（技能）**：你创建的自定义命令（如 `/my-command`）
- **Agent（智能体）**：解决特定问题的专门助手
- **Hook（钩子）**：在事件发生时自动运行的自动化（文件保存、提交等）
- **MCP 服务器**：外部服务集成（GitHub、Slack、数据库）
- **LSP 服务器**：语言智能（代码导航、诊断）

与其分别构建每个组件，插件将它们打包在一起，便于与你的团队或社区共享，或发现他人构建的插件。

可以把插件理解为"Claude Code 包"——类似于 Node.js 的 npm 包。

---

## 官方市场

Anthropic 维护官方市场（`claude-plugins-official`），启动 Claude Code 时自动可用。浏览方式：

```bash
/plugin
```

这会打开插件管理器，包含四个标签页：**Discover（发现）**、**Installed（已安装）**、**Marketplaces（市场）** 和 **Errors（错误）**。

### 官方市场中的分类

**代码智能插件**配置语言服务器协议（LSP）连接，实现实时代码分析。安装后，你将获得自动诊断（类型错误、缺失导入、语法问题）和代码导航（跳转定义、查找引用、列表符号）。

| 语言       | 插件                | 需要的二进制         |
| ---------- | ------------------- | -------------------- |
| Python     | `pyright-lsp`       | `pyright-langserver` |
| TypeScript | `typescript-lsp`    | `typescript-language-server` |
| Go         | `gopls-lsp`         | `gopls`              |
| Rust       | `rust-analyzer-lsp` | `rust-analyzer`      |
| Java       | `jdtls-lsp`         | `jdtls`              |
| C/C++      | `clangd-lsp`        | `clangd`             |

**外部集成**为常见工具预先配置 MCP 服务器：

- **GitHub**、**GitLab**：源代码控制与 PR 工作流
- **Jira**、**Asana**、**Linear**、**Notion**：项目管理
- **Slack**、**Discord**：团队沟通
- **Vercel**、**Firebase**、**Supabase**：云部署
- **Figma**：设计协作

**开发工作流**为常见任务添加命令和智能体：

- `commit-commands`：git 工作流（提交、推送、PR 创建）
- `pr-review-toolkit`：自动化拉取请求审查
- `agent-sdk-dev`：Agent SDK 开发工具
- `plugin-dev`：插件创建工具包

---

## 安装与管理插件

### 从官方市场安装

直接从命令行安装插件：

```bash
/plugin install github@claude-plugins-official
```

或使用交互式 UI：运行 `/plugin`，进入 **Discover** 标签页，选择插件并选择安装范围。

### 安装范围

安装时，选择插件的生效范围：

- **User scope（用户范围）**：默认，在所有项目中都可用
- **Project scope（项目范围）**：添加到 `.claude/settings.json`，与团队共享
- **Local scope（本地范围）**：仅在当前项目，不共享
- **Managed scope（托管范围）**：管理员配置，只读

团队插件应使用项目范围，这样所有协作者都会自动获得相同的工具。

### 管理已安装的插件

列出所有已安装插件：

```bash
/plugin
→ Installed 标签页
```

禁用插件但不卸载：

```bash
/plugin disable plugin-name@marketplace-name
```

重新启用禁用的插件：

```bash
/plugin enable plugin-name@marketplace-name
```

完全移除：

```bash
/plugin uninstall plugin-name@marketplace-name
```

做完更改后，在当前会话中重新加载插件：

```bash
/reload-plugins
```

---

## 社区市场

除官方市场外，任何人都可以创建并共享市场。使用以下命令添加社区市场：

```bash
/plugin marketplace add anthropics/claude-code
```

这会注册市场但不安装任何插件——你仍然可以逐个选择要安装的插件。

### 从不同来源添加市场

**GitHub 仓库**（推荐，透明度高）：

```bash
/plugin marketplace add owner/repo
```

仓库必须包含 `.claude-plugin/marketplace.json` 文件和插件定义。

**Git URL**（GitLab、Bitbucket、自托管）：

```bash
/plugin marketplace add https://gitlab.com/company/plugins.git
/plugin marketplace add git@github.com:org/plugins.git#v1.0.0
```

**本地路径**（开发）：

```bash
/plugin marketplace add ./my-marketplace
/plugin marketplace add ./path/to/marketplace.json
```

**远程 URL**（简单托管）：

```bash
/plugin marketplace add https://example.com/marketplace.json
```

### 管理市场

列出所有配置的市场：

```bash
/plugin marketplace list
```

更新市场列表以获取新插件：

```bash
/plugin marketplace update marketplace-name
```

移除市场（会卸载其插件）：

```bash
/plugin marketplace remove marketplace-name
```

### 自动更新

官方 Anthropic 市场默认自动更新。在 UI 中切换自动更新：

```bash
/plugin
→ Marketplaces 标签页
→ 选择市场
→ 启用/禁用自动更新
```

或使用环境变量：

```bash
export DISABLE_AUTOUPDATER=true
export FORCE_AUTOUPDATE_PLUGINS=true
```

这保持插件更新，同时手动管理 Claude Code 更新。

---

## 构建自己的插件

插件是包含 `PLUGIN.md` 文件和 `marketplace.json` 清单的目录。快速开始：

```bash
/plugin create my-awesome-plugin
```

这会生成：

```
my-awesome-plugin/
├── PLUGIN.md              # 插件元数据和描述
├── .claude-plugin/
│   ├── marketplace.json   # 插件定义
│   ├── skills/            # 自定义命令（可选）
│   ├── agents/            # 专门智能体（可选）
│   └── hooks/             # 自动化触发器（可选）
└── README.md              # 仓库说明
```

**PLUGIN.md** 描述插件的功能：

```markdown
---
name: my-awesome-plugin
version: 1.0.0
description: 此插件的简短描述
author: 你的名字
license: MIT
---

## 此插件提供

- 一个 `/my-command` skill
- 一个 `my-agent` 智能体用于 X 任务
- 与 [服务] 的集成

## 安装

从市场安装：

/plugin install my-awesome-plugin@my-org

## 用法

运行 `/my-command --help` 了解选项。
```

**marketplace.json** 告诉 Claude Code 插件中有哪些组件：

```json
{
  "plugins": [
    {
      "name": "my-awesome-plugin",
      "description": "它的功能",
      "version": "1.0.0",
      "components": {
        "skills": ["skills/my-command/SKILL.md"],
        "agents": ["agents/my-agent/AGENT.md"],
        "mcp_servers": ["mcp/config.json"]
      }
    }
  ]
}
```

创建后，通过发布到市场（推荐用 GitHub）并宣传其 `owner/repo` 来共享。

---

## 团队市场设置

对于团队特定的插件，在 `.claude/settings.json` 中配置：

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "my-team-plugin@my-team-tools": {
      "enabled": true,
      "scope": "project"
    }
  }
}
```

当团队成员信任仓库时，Claude Code 会提示他们自动安装团队插件。

---

## 安全考虑

插件是高度受信任的——它们可以在你的机器上执行任意代码。仅从你信任的来源安装插件。

**安装前：**

- 验证插件作者
- 查看插件仓库和最近的提交
- 检查它请求的权限（文件访问、外部服务）
- 阅读插件文档

**对于团队：**

- 要求新插件的市场批准
- 添加到 `.claude/settings.json` 前审核插件
- 使用托管设置限制开发者可添加的市场
- 记录每个插件的必要性

**危险信号：**

- 没有公开仓库或源代码
- 请求在启动时运行任意 shell 命令
- 不维护（6+ 个月没有提交）
- 没有清晰的外部集成隐私政策

Anthropic 不审查或验证第三方插件——你负责自己安装的内容。

---

## 故障排除

**`/plugin` 命令无法识别**

更新 Claude Code 至 1.0.33+：

```bash
brew upgrade claude-code     # macOS with Homebrew
npm update -g @anthropic-ai/claude-code  # npm
```

**安装后插件技能未出现**

清除插件缓存并重新安装：

```bash
rm -rf ~/.claude/plugins/cache
/reload-plugins
/plugin install plugin-name@marketplace
```

**语言服务器未启动**

安装所需的二进制文件并验证它在你的 PATH 中：

```bash
which pyright-langserver    # Python 示例
which typescript-language-server  # TypeScript 示例
```

查看 `/plugin` Errors 标签页了解详细诊断。

**代码智能插件内存使用过高**

大型语言服务器（rust-analyzer、pyright）消耗大量内存。如需要，禁用并依赖 Claude 的内置搜索：

```bash
/plugin disable rust-analyzer-lsp@claude-plugins-official
```

---

## 下一步

- **使用官方插件**：运行 `/plugin` 并为你的语言安装代码智能插件
- **试试演示市场**：`anthropics/claude-code` 有展示最佳实践的示例插件
- **构建一个 skill**：在构建完整插件前先创建你的第一个自定义技能
- **与团队共享**：当你有有用的插件时，将其添加到团队市场
- **阅读插件参考**：[code.claude.com/docs/plugins](https://code.claude.com/docs)
