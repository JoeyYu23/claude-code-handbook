# 第 3 章：计划任务与自动化循环

## 自动化的机遇

想象这样的场景：每天上午 9 点，你希望团队收到关于核心代码库中过时依赖项的通知。每周五，你希望对拉取请求进行自动化代码审查。每小时，你希望轮询部署状态，一旦出现问题立即警告团队。

没有自动化，这些任务全靠自律——你必须记得去运行它们，一旦忘记就会漏掉。有了自动化，它们就会自然发生，始终如一、可靠稳定，而你可以专注于更重要的工作。

这正是 Claude Code 调度系统所提供的：定义在你设定的计划下自动运行的工作，无需你守在键盘前触发。

---

## 三种调度方式

Claude Code 提供三种不同的方式来自动化周期性工作，每种方式针对不同的使用场景：

### 使用 `/loop` 的会话级调度

在活跃的 Claude Code 会话中自动化工作的最快方式。你设置一个循环提示，它在后台运行，而你的终端保持打开状态。

**最适合：** 开发期间的快速轮询、临时检查、自动化模式的实验。

**限制：** 仅在 Claude Code 会话活跃时运行。最长 3 天后自动过期。只适用于不需要持久状态的任务。

**最小间隔：** 1 分钟（其他方式的最小间隔为 1 小时）。

### 桌面计划任务

基于配置文件的调度，直接在你的机器上运行。任务在机器重启后仍然存在，不需要活跃的 Claude Code 会话。

**最适合：** 生产级自动化、需要访问本地文件的工作流、使用标准计划管理机器的团队。

**限制：** 需要机器开机，并配置了 launchd（macOS）或同等系统调度器。无云端冗余。

### 云计划任务

托管在 Anthropic 基础设施上的持久任务。无论你的机器是否开机都能可靠运行。

**最适合：** 关键的生产工作流、不能被跳过的任务、不依赖本地文件的工作。

**限制：** 每次运行时对代码库进行全新克隆（无持久本地状态）。最小间隔 1 小时。自主运行，无权限提示。

---

## 使用 `/loop` 快速轮询

`/loop` 命令是从"我想让这件事反复执行"到"它正在反复执行"的最快路径。

### 基本语法

```
/loop 5m check if the deployment finished and tell me what happened
```

Claude Code 解析你的请求，创建一个 cron 任务，并在后台运行。时间间隔是可选的——如果不指定，默认为每 10 分钟执行一次。

### 间隔语法

你可以在开头指定间隔、在结尾指定，或完全省略：

```
/loop 30m check the build
```

```
/loop check the build every 2 hours
```

```
/loop check the build
```

支持的时间单位：
- `s` 秒（向上取整到最近的分钟）
- `m` 分钟
- `h` 小时
- `d` 天

无法整除的间隔（如 `7m` 或 `90m`）会被取整到最近的干净间隔，Claude Code 会告知你最终选择了什么。

### 循环调用其他命令

计划提示可以调用另一个 Skill，当你已经将工作流打包成 Skill 时特别有用：

```
/loop 20m /review-pr 1234
```

每次任务触发时，Claude Code 就像你亲手输入一样运行 `/review-pr 1234`。

### 一次性提醒

对于非周期性提醒，用自然语言描述即可，Claude Code 会安排一个单次触发任务：

```
remind me at 3pm to push the release branch
```

```
in 45 minutes, check whether the integration tests passed
```

Claude Code 使用 cron 将触发时间固定到具体的小时和分钟，并确认何时运行。

### 管理循环任务

列出所有计划任务：

```
what scheduled tasks do I have?
```

取消特定任务：

```
cancel the deploy check job
```

在底层，Claude Code 使用三个工具：
- **CronCreate**：使用 5 字段 cron 表达式安排新任务。
- **CronList**：列出所有活跃的计划任务。
- **CronDelete**：通过 ID 取消任务。

每个任务会获得一个 8 字符的 ID。一个会话最多可以同时持有 50 个任务。

### `/loop` 的执行机制

调度器每秒检查到期任务，并以低优先级将其加入队列。计划提示会在你的交互轮次之间触发——在你输入内容时，或 Claude Code 等待你下一条消息时——而不是在 Claude Code 正在响应的过程中。

如果任务到期时 Claude Code 正忙，提示会等到当前轮次完成后再触发。所有时间均以你的本地时区为准。

### 抖动与过期

为了避免"惊群效应"（所有会话在同一时刻访问 API），调度器会添加小的、确定性的偏移：

- 周期性任务最多延迟其周期的 10%，上限为 15 分钟。例如，每小时任务可能在 `:00` 到 `:06` 之间触发。
- 设定在整点或半点的一次性提醒最多提前 90 秒触发。

偏移量由任务 ID 决定，因此同一个任务的偏移量始终相同。

**重要提示：** 周期性 `/loop` 任务在创建 3 天后自动过期。任务会触发最后一次，然后自动删除。这可以防止遗忘的循环无限运行。如果需要更长期的自动化，请使用桌面或云计划任务。

---

## 桌面计划任务

对于需要在不开启会话的情况下可靠运行的自动化，可以通过 Claude Code 的配置文件设置桌面计划任务。

### 设置桌面任务

在 macOS 上，任务通过 `.claude/desktop-tasks.json` 管理：

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

在你的主目录下的 `.claude` 文件夹中创建或编辑此文件。Claude Code 会监视该配置并在启动时加载任务。

### Cron 表达式参考

桌面（和云）任务使用标准的 5 字段 cron 表达式：

```
minute hour day-of-month month day-of-week
```

常用示例：

| 表达式 | 含义 |
|---|---|
| `*/5 * * * *` | 每 5 分钟 |
| `0 * * * *` | 每小时整点 |
| `7 * * * *` | 每小时第 7 分钟 |
| `0 9 * * *` | 每天上午 9 点（本地时间） |
| `0 9 * * 1-5` | 工作日上午 9 点 |
| `30 14 15 3 *` | 3 月 15 日下午 2:30 |

所有字段支持：
- 通配符：`*`（任意值）
- 单个值：`5`
- 步长：`*/15`（每隔 15 个值）
- 范围：`1-5`
- 列表：`1,15,30`

星期几字段中，`0` 或 `7` 表示周日，`6` 表示周六。不支持扩展 cron 语法（L、W、?，以及 MON 等名称别名）。

### MCP 服务器与权限

桌面任务继承你的 `.claude/mcp.json` 中配置的 MCP 服务器。你也可以为单个任务指定连接器，用于 GitHub、Slack、Linear 等集成。

```json
{
  "tasks": [
    {
      "id": "pr-review",
      "schedule": "0 10 * * 1-5",
      "prompt": "review open PRs and summarize blockers",
      "connectors": ["github"],
      "enabled": true
    }
  ]
}
```

任务默认自主运行——不会弹出权限提示。如果你希望对敏感操作进行提示，可以为该任务设置 `requiresApproval: true`。

---

## 云计划任务

对于必须在云端可靠运行、不依赖本地机器状态的工作，可以通过 `claude.ai` 创建任务。

### 创建云任务

1. 登录 claude.ai，导航到**计划任务**（Scheduled Tasks）。
2. 点击**创建任务**（Create Task）。
3. 输入名称和描述。
4. 编写你的提示（即你希望运行的工作内容）。
5. 使用 cron 表达式设置计划。
6. 连接代码库并集成服务（GitHub、Slack、Linear）。
7. 点击**创建**——任务立即生效。

任务会立刻按照设定的计划开始运行。

### 云任务能力

云任务与桌面或 `/loop` 任务的能力有所不同：

- **无本地文件访问。** 每次运行都对代码库进行全新克隆，无法访问你机器上的文件。
- **集成连接器。** GitHub、Slack、Linear 等服务可在云端环境中直接使用。
- **自主执行。** 任务无需权限提示自主运行，Claude Code 已经审核并批准了该自动化配置。
- **最小间隔 1 小时。** 云任务的运行频率不能超过每小时一次（会话级 `/loop` 任务可以每分钟运行一次）。

### 示例：每日依赖检查

```
Prompt: Check all dependencies in package.json and dependencies.txt files.
Identify any packages that have newer major versions available.
Report critical security advisories from GitHub Security Advisories.
Post findings to #engineering-alerts Slack channel.

Schedule: 0 9 * * *
Connectors: github, slack
```

这个任务每天上午 9 点运行。它全新克隆你的代码库，检查依赖项，查询 GitHub 安全数据库，并将结果发布到 Slack——全程自动完成。

### 查看云任务运行记录

每个任务在 `claude.ai` 中都有可查看的运行历史，包括：

- 执行时间和持续时长
- 完整执行日志（Claude Code 做了什么）
- 输出结果
- 任何错误或警告

如果任务失败，你可以查看具体的失败原因，并手动重新运行。

---

## 社区工具

开源生态为 Claude Code 贡献了多个调度工具，扩展了内置功能。如果内置选项不完全满足你的需求，这些工具值得一试。

### [claudecron](https://github.com/phildougherty/claudecron)（GitHub: phildougherty/claudecron）

适用于 Claude Code 的自托管 cron 调度器。适合以下场景：

- 希望完全掌控调度基础设施
- 需要原生 cron 语法不支持的自定义计划
- 在 Claude Code 完成后触发任意 Webhook

基本工作流：
1. 在你的服务器或本地机器上部署 claudecron。
2. 在 YAML 中定义计划。
3. claudecron 按计划调用 Claude Code 并接收结果。

### [claude-tasks](https://github.com/kylemclaren/claude-tasks)（GitHub: kylemclaren/claude-tasks）

包装 Claude Code 并增加以下功能的任务运行器：

- 任务依赖链（运行任务 A，A 完成后运行任务 B）
- 带指数退避的重试逻辑
- 日志和可观察性
- 跨运行的本地状态持久化

### [claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler)（GitHub: jshchnz/claude-code-scheduler）

专注于桌面和 macOS launchd 集成，提供：

- 用于创建和管理计划任务的图形界面
- 更好的错误通知
- 与 macOS 原生调度的集成

---

## 常见自动化模式

以下是可以用 Claude Code 调度功能实现的真实场景模式：

### 每日代码审查摘要

**云任务，每天上午 9 点：**

```
List all PRs opened in the last 24 hours across our core repositories.
For each PR, note the title, author, and status (awaiting review, approved, etc.).
Identify any PRs that have been waiting for review for more than 24 hours.
Post a summary to #code-review Slack channel with links.
```

确保团队不会遗漏任何评审，阻塞情况始终可见。

### 依赖更新检查

**桌面任务，每周一上午 6 点：**

```
Check dependencies.txt and package.json in ~/projects/production-api/.
Identify packages with newer minor or patch versions available.
List any with pending security advisories.
Create a GitHub issue titled "Dependency updates available" if there are
actionable updates, otherwise report completion.
```

无需手动检查，主动掌握依赖更新情况。

### 部署状态轮询

**发布期间的会话 `/loop`：**

```
/loop 5m check deployment status for rollout-2024-03-26 and alert if any pod is failing
```

在关键部署期间，无需频繁手动检查，及时获取状态信息。

### 文档新鲜度检查

**云任务，每周五下午 5 点：**

```
List all markdown files in the docs/ directory.
For each file, extract the "last updated" date from front matter.
Identify any docs that have not been updated in the last 90 days.
Create a GitHub discussion asking if they still accurate.
```

确保文档保持最新，值得信赖。

### PR 评论自动化

**桌面任务，每 30 分钟：**

```
List all open PRs in the last 30 minutes.
For each PR, check if it has a description.
If the description is empty or a one-liner, add a helpful comment:
"Consider adding a description of changes, motivation, and testing performed."
```

以温和的方式引导更好的 PR 规范，而不显得强硬。

### 构建失败通知

**云任务，每 30 分钟：**

```
Check the CI/CD pipeline status.
If any build is failing, identify which tests failed.
Post detailed findings to #engineering Slack and tag the commit author.
```

比邮件摘要更快地将信息传递给相关人员。

---

## 如何选择调度方式

| 使用 `/loop` 的场景 | 使用桌面的场景 | 使用云的场景 |
|---|---|---|
| 你正在积极工作，需要快速轮询 | 需要持久、稳定的自动化 | 需要云级别的可靠性 |
| 任务是临时性的（几小时） | 机器始终开机且已配置 | 机器关机时工作也必须继续 |
| 想要测试自动化模式 | 任务需要访问本地文件 | 任务应自主运行，无需批准提示 |
| 需要最小 1 分钟间隔 | 需要完全掌控本地机器环境 | 希望有可审计的集中任务历史 |

实用建议：先用 `/loop` 验证自动化想法。一旦确认有效，如果没有本地依赖则迁移到云端，有本地依赖则迁移到桌面。

---

## Cron 表达式快速参考

5 字段格式：`分钟 小时 日期 月份 星期几`

```
# 基本间隔
*/5 * * * *      每 5 分钟
0 * * * *        每小时整点
0 0 * * *        每天午夜
0 0 * * 0        每周（周日）
0 0 1 * *        每月第一天

# 工作时间
0 9-17 * * 1-5   工作日每小时，上午 9 点到下午 5 点
30 18 * * 1-5    工作日每天下午 6:30

# 特定时间
0 9 * * *        每天上午 9 点
0 14 15 * *      每月 15 日下午 2 点
30 2 * * 1       每周一凌晨 2:30
```

---

## 计划自动化的最佳实践

### 1. 从明确的信号开始

在自动化之前先定义成功的标准。如果任务是"检查构建"，你具体在检查什么？"构建失败"？"构建缓慢"？"异常模式"？模糊的自动化产生模糊的结果。

### 2. 优雅地处理失败

计划任务在遇到错误时不应崩溃，而应这样处理：

```
List all active deployments.
If any deployment status is unavailable, report "service unreachable"
and continue with other checks.
Do not fail the whole task.
```

### 3. 包含足够的上下文

任务报告结果时，应包含足够的上下文，让读者无需进一步调查：

```
不好："3 个 PR 等待审查"
更好："3 个等待超过 24 小时的 PR：
- #1234 (api) - auth refactor，分配给 @alice
- #1235 (frontend) - dark mode，分配给 @bob
- #1236 (infra) - caching，分配给 @carol"
```

### 4. 避免惊群效应

如果有多个相关任务（检查部署、检查日志、检查指标），将它们错开：

```
部署检查：0 9 * * *
日志分析：5 9 * * *
指标审查：10 9 * * *
```

不要都设在 9:00 整。

### 5. 包含禁用机制

对于长期运行的自动化，提供一种在不删除任务的情况下暂停的方式：

```
"enabled": true   # 设为 false 可暂停
```

这可以防止在维护窗口期间意外触发。

### 6. 记录执行日志

云和桌面任务应记录它们的操作。会话 `/loop` 任务是临时性的，但如果你依赖某个任务正确运行，就需要有证据：

```
Started dependency check at 2024-03-26 09:00:15 UTC
Scanned 47 files in main branch
Found 3 outdated packages
Found 0 security advisories
Task completed successfully
```

### 7. 监控任务健康状态

云和桌面任务都有运行历史，定期检查：

- 任务运行了多少次？
- 是否曾经失败？
- 计划是否正确，还是已经偏移？

---

## 环境变量

你可以通过环境变量控制 Claude Code 的调度行为：

```bash
# 完全禁用调度器
CLAUDE_CODE_DISABLE_CRON=1

# 仅禁用云任务
CLAUDE_CODE_DISABLE_CLOUD_TASKS=1

# 禁用桌面任务
CLAUDE_CODE_DISABLE_DESKTOP_TASKS=1
```

---

## 限制与注意事项

### 会话 `/loop` 的限制

- 任务仅在 Claude Code 运行且空闲时触发。
- 不补偿错过的触发。如果你正在处理一个长时间请求，到期的计划任务会在你空闲后触发一次，而不是触发多次。
- 不跨重启持久。重启 Claude Code 会清除所有 `/loop` 任务。
- 最长 3 天过期。

### 云任务的限制

- 每次运行对代码库进行全新克隆（无持久本地状态）。
- 最小间隔 1 小时。
- 无权限提示自主运行。
- 无法访问你机器的文件系统或环境。

### 桌面任务的限制

- 需要机器开机并运行 launchd 或同等软件。
- 不跨多台机器同步（每台机器各自运行自己的任务）。
- 需要在 `.claude/` 文件中手动配置。

---

## 参考资料

- [Claude Code Scheduled Tasks](https://code.claude.com/docs/en/scheduled-tasks)
- [claudecron](https://github.com/phildougherty/claudecron)
- [claude-tasks](https://github.com/kylemclaren/claude-tasks)
- [claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler)

---

**接下来：** [第 4 章 — 云服务商与远程控制](./04-cloud-remote.md)
