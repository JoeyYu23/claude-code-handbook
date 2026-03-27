# 第 3 章：计划任务与自动化循环

## 自动化的机会

想象一下：每天上午 9 点，你的团队被通知关键存储库中的过时依赖。每个周五，你想要一个自动代码审查拉取请求。每小时，你想轮询部署状态并在任何东西出问题时警告团队。

没有自动化，这些任务需要纪律 — 你必须记住运行它们，如果你没有，它们不会发生。有了自动化，它们只是一致地可靠地发生，而你专注于更重要的工作。

这是 Claude Code 的调度系统提供的：定义在你设置的计划上自动运行的工作的能力，无需你在键盘上。

---

## 三种调度方法

Claude Code 提供三种不同的方式来自动化定期工作。每一种都针对不同的场景设计：

### 使用 `/loop` 的会话范围调度

在活跃的 Claude Code 会话内自动化工作的最快方式。你设置一个在背景中激活的定期提示，而你的终端保持打开。

**最好用于：** 开发期间的快速轮询、临时检查、自动化模式的实验。

**限制：** 仅在 Claude Code 会话活跃时运行。在 3 天后过期。受限于不需要持久状态的任务。

**最小间隔：** 1 分钟（其他选项有 1 小时最小）。

### 桌面计划任务

直接在你的机器上运行的配置基础调度。任务跨机器重启持久，不需要活跃 Claude Code 会话。

**最好用于：** 生产自动化、需要本地文件访问的工作流、有标准计划的团队管理机器。

**限制：** 需要你的机器打开并配置有 launchd（macOS）或等效系统调度器。无云冗余。

### 云计划任务

在 Anthropic 基础设施上托管的持久任务。无论你的机器是否打开都可靠运行。

**最好用于：** 关键生产工作流、不能被跳过的任务、不依赖本地文件的工作。

**限制：** 每次运行时新克隆存储库（无持久本地状态）。最小 1 小时间隔。自主运行无权限提示。

---

## 使用 `/loop` 的快速轮询

`/loop` 技能是从"我想这重复运行"到"它正在重复运行"的最快路径。

### 基本语法

```
/loop 5m check if the deployment finished and tell me what happened
```

Claude Code 解析你的请求、创建一个 cron 工作，并在背景中运行。间隔是可选的 — 如果你不指定，它默认为每 10 分钟。

### 间隔语法

你可以在开始、结束或隐含地指定间隔：

```
/loop 30m check the build
/loop check the build every 2 hours
/loop check the build
```

支持的单位：
- `s` 秒（四舍五入到最近分钟）
- `m` 分钟
- `h` 小时
- `d` 天

不能均匀除（如 `7m` 或 `90m`）的间隔四舍五入到最近的清晰间隔，Claude Code 告诉你选择了什么。

### 循环命令

计划的提示可以调用另一个技能。当你已经打包工作流时这很有用：

```
/loop 20m /review-pr 1234
```

每次工作激活，Claude Code 运行 `/review-pr 1234` 就像你输入了它。

### 一次性提醒

对于非定期提醒，用自然语言描述。Claude Code 计划单次激活任务：

```
remind me at 3pm to push the release branch
in 45 minutes, check whether the integration tests passed
```

Claude Code 将激活时间固定到特定小时和分钟使用 cron。

### 管理循环

列出所有计划任务：

```
what scheduled tasks do I have?
```

取消特定任务：

```
cancel the deploy check job
```

---

## 桌面计划任务

对于自动化需要无你会话活跃可靠运行，通过 Claude Code 配置文件配置桌面计划任务。

### 在 `.claude/desktop-tasks.json` 中设置：

```json
{
  "tasks": [
    {
      "id": "daily-dependency-check",
      "schedule": "0 9 * * *",
      "prompt": "check for outdated dependencies in all repos and report critical ones",
      "enabled": true
    }
  ]
}
```

---

## 云计划任务

对于必须在云中可靠运行的工作，通过 `claude.ai` 创建任务。

### 创建云任务：

1. 登录 claude.ai，导航到**计划任务**。
2. 点击**创建任务**。
3. 输入名称和描述。
4. 写你的提示（你想运行的工作）。
5. 使用 cron 表达式设置计划。
6. 连接存储库和集成服务（GitHub、Slack、Linear）。
7. 点击**创建** — 任务现在活跃。

---

## 常见自动化模式

### 每日代码审查摘要

**云任务，每天上午 9 点：**

```
List all PRs opened in the last 24 hours.
Identify any PRs waiting >24 hours for review.
Post summary to #code-review Slack channel.
```

### 依赖更新检查

**桌面任务，周一上午 6 点：**

```
Check dependencies.txt and package.json.
Identify packages with newer versions available.
List any with security advisories.
Create GitHub issue if updates available.
```

### 部署状态轮询

**会话 `/loop` 在推出期间：**

```
/loop 5m check deployment status and alert if any pod is failing
```

### 文档新鲜度检查

**云任务，每周五下午 5 点：**

```
List all markdown files in docs/ directory.
Identify any not updated in last 90 days.
Create GitHub discussion asking if still accurate.
```

---

## 选择哪个方法

| 何时使用 `/loop` | 何时使用桌面 | 何时使用云 |
|---|---|---|
| 积极工作，想快速轮询 | 需要持久、可靠自动化 | 需要云规模可靠性 |
| 任务是临时的（几小时） | 机器总是打开和配置 | 工作必须运行即使机器关闭 |
| 想测试自动化模式 | 任务需要本地文件访问 | 任务应该自主、无批准提示 |
| 需要最小 1 分钟间隔 | 完全控制机器环境 | 想要可审计、集中任务历史 |

---

## Cron 表达式快速参考

5 字段格式：`分钟 小时 日 月 周几`

```
*/5 * * * *      每 5 分钟
0 * * * *        每小时
0 0 * * *        每天午夜
0 9 * * *        每天上午 9 点
0 9 * * 1-5      工作日上午 9 点
```

---

**接下来：** [第 4 章 — 云服务商与远程控制](./04-cloud-remote.md)
