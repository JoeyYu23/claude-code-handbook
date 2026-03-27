# 第二十一章：远程连接

## 什么是远程连接

远程控制是 Claude Code 的一项功能，让你可以从任何浏览器或移动设备继续在本地机器上运行的 Claude Code 会话。你在办公桌前开始一个任务，之后可以用手机、平板或另一台电脑接着做——不会中断会话，也不会丢失任何上下文。

关键的架构要点：你的代码不会移动到云端。Claude Code 进程持续在你的本地机器上运行。Web 和移动端界面只是进入本地会话的窗口。你的文件系统、MCP 服务器、本地工具和项目配置全都保留在本地机器上，在远程会话期间仍然可用。

这与 Claude Code 网页版（运行在 Anthropic 托管的云基础设施上）不同。远程控制在本地运行，并通过远程方式连接。

---

## 使用前提

使用远程控制之前，需要满足以下条件：

- Claude Code v2.1.51 或更高版本（运行 `claude --version` 查看）
- 付费订阅计划（Pro、Max、Team 或 Enterprise — 不支持 API Key 方式）
- 通过 claude.ai 完成认证（未登录请运行 `/login`）
- 在项目目录中已接受工作区信任（在该目录中运行一次 `claude`）

对于 Team 和 Enterprise 计划，管理员需要先在后台设置中启用 Claude Code，团队成员才能使用远程控制功能。

---

## 配置远程访问

启动远程控制会话有以下几种方式：

**服务器模式（专用远程会话）：**

```bash
cd your-project
claude remote-control --name "My Project"
```

该进程在终端中运行，等待远程连接。它会显示会话 URL，按空格键可以切换显示供手机扫码使用的二维码。当你想让会话持续运行、并不时从其他设备查看进度时，这是最合适的模式。

**启用远程的交互式会话：**

```bash
claude --remote-control "Feature: OAuth Migration"
```

这会给你一个完整的交互式终端会话，同时也可以从 claude.ai 或 Claude 移动应用控制。与服务器模式不同，你可以在本地输入消息的同时，会话也对远程可用。

**在 claude.ai 云端创建会话：**

```bash
claude --remote
```

这会在 claude.ai/code 上创建一个托管于 Anthropic 基础设施的云端会话。该会话不依赖于你的本地机器——你可以从任何浏览器连接，即使本地终端关闭，会话也会持续存在。

**将云端会话拉取到本地终端：**

```bash
claude --teleport "session-name"
```

`--teleport` 会将 claude.ai 上的现有云端会话拉取到你的本地终端，使其可以访问本地工具（文件系统、MCP 服务器、本地命令）。这让你可以先在手机上开始一个会话，然后在终端中以完整的本地工具访问权限继续。

**为现有会话启用远程控制：**

如果你已经在某个会话中，想要启用远程访问：

```text
/remote-control My Project
# 简写：
/rc My Project
```

这会在当前会话中启动远程控制，并保留现有的对话历史。

---

## 从其他设备连接

远程控制激活后，有以下几种连接方式：

**直接 URL：** `claude remote-control` 和 `/remote-control` 都会显示会话 URL。在任何浏览器中打开即可直接进入 [claude.ai/code](https://claude.ai/code) 上的会话。

**二维码：** 使用 `claude remote-control`（服务器模式）时，按空格键切换显示二维码。用 iOS 或 Android 上的 Claude 应用扫码，直接打开会话。

**会话列表：** 打开 [claude.ai/code](https://claude.ai/code) 或 Claude 移动应用，在会话列表中按名称找到对应会话。当本地机器在线时，远程控制会话会显示一个带有绿色状态点的电脑图标。

---

## 服务器模式选项

服务器模式（`claude remote-control`）有几个实用参数：

```bash
# 自定义显示在会话列表中的会话名称
claude remote-control --name "Backend Refactor"

# 运行多个并发会话，每个会话在独立的 git worktree 中
# （需要 git 仓库 — 每个新会话获得一个全新的 worktree）
claude remote-control --spawn worktree

# 允许所有会话共享同一个目录
# （如果编辑相同文件，会话之间可能冲突）
claude remote-control --spawn same-dir

# 设置最大并发会话数
claude remote-control --capacity 4

# 调试时输出详细日志
claude remote-control --verbose

# 启用文件系统和网络沙箱
claude remote-control --sandbox
```

`--spawn worktree` 选项对团队特别有用：它为每个远程会话创建独立的 git worktree，多人可以在同一仓库上并行工作，而不会互相干扰各自的变更。

---

## 为所有会话启用远程控制

如果你经常需要跨设备工作，可以为每次交互式会话自动启用远程控制：

```text
/config
```

将"Enable Remote Control for all sessions"设为 `true`。启用后，每个交互式 Claude Code 进程都会自动注册一个远程会话。多个实例各自拥有独立的环境和会话。

---

## 自托管环境的 SSH 隧道

如果你在远程服务器上运行 Claude Code（云 VM、企业防火墙后的开发机器，或专用构建服务器），可以结合 SSH 隧道和远程控制来访问它。

**设置方法：**

1. 在远程服务器上启动启用了远程控制的 Claude Code：

```bash
# 在远程服务器上
ssh user@dev-server.example.com
cd project-dir
claude remote-control --name "Dev Server Session"
```

2. 会话 URL 和二维码会显示在服务器终端上
3. 从任何设备通过会话 URL 连接

这种模式适用于以下场景：
- 在配置了大内存的远程开发服务器上工作
- 访问有权限连接内网资源的机器
- 在 GPU 服务器上进行机器学习开发
- 在代码不能离开内网的企业环境中开发

**完全本地隧道（不经过 claude.ai 中转）：**

Claude Code 的远程控制默认通过 Anthropic API 中转。对于要求所有流量留在本地的环境，当前版本没有支持自托管中转的选项。在这种情况下，你可以使用 SSH 端口转发直接连接到本地的 Claude Code 终端，而不是使用远程控制功能。

---

## 跨机器工作

远程控制支持一种自然的跨机器工作流：

**早上在办公室：**
```bash
# 在工作机器上启动会话
claude --remote-control "Sprint 14 - Payment Refactor"
```

**通勤回家途中：**
- 打开 Claude 应用
- 在会话列表中找到"Sprint 14 - Payment Refactor"
- 查看 Claude 完成了什么，给出反馈，回答问题

**到家后：**
```bash
# 从家里的机器连接同一个会话
# （或使用 claude.ai/code 网页版）
```

所有已连接设备的对话保持同步。从终端、浏览器和移动应用发送的消息都是同一个会话的一部分。

---

## 安全注意事项

**连接方式：**

你的本地 Claude Code 会话只发出向外的 HTTPS 请求，从不在你的机器上打开入站端口。启动远程控制时，它会向 Anthropic API 注册并轮询工作。当你从其他设备连接时，Anthropic 服务器通过流式连接在客户端和你的本地会话之间路由消息。

所有流量通过 TLS 经过 Anthropic API 传输——与任何 Claude Code 会话的传输安全性相同。连接使用多个短期凭据，每个凭据作用域单一且独立过期。

**安全影响：**

- 你的代码和文件内容在本地机器上处理
- 消息（你的提示词和 Claude 的回复）经过 Anthropic API 传输（与非远程控制会话相同）
- Anthropic 的基础设施上不会保存你代码的持久副本
- 会话与你的 claude.ai 账号绑定——只有你授权的账号才能连接

**对于敏感代码库：**

与标准 Claude Code 会话相比，远程控制不会改变数据流——两者都涉及消息经过 Anthropic API 传输。区别在于远程控制还涉及来自其他设备的消息。如果你的组织策略允许使用 Claude Code，远程控制不会带来实质性的额外风险。

对于安全要求最高的代码库，请审查你的组织对以下内容的政策：
- 远程控制中转路径是否获批（流量经过 Anthropic 服务器）
- 移动设备是否获批用于开发访问
- 对外访问是否需要 `--sandbox` 标志

---

## 故障排查

**会话未出现在设备列表中：**

确认本地机器已唤醒并连接网络。远程控制需要本地机器保持可达。如果机器处于休眠状态，会话可能已超时——重新运行 `claude remote-control`。

**连接断开且无法恢复：**

远程控制会在网络中断后自动重连。对于较长时间的中断（机器唤醒状态下超过约 10 分钟），会话会超时。重新运行 `claude remote-control` 即可开始新会话。之前会话的对话历史保留在本地，可以用 `claude --continue` 恢复。

**Team/Enterprise 出现"Claude Code not enabled"错误：**

管理员需要先在 claude.ai/admin-settings/claude-code 的后台设置中启用 Claude Code，团队成员才能使用远程控制。

**终端必须保持打开：**

远程控制作为本地进程运行。如果关闭终端窗口或终止 `claude` 进程，会话就会结束。对于希望无限期保持的会话（即使关闭电脑盖子），可以在终端复用器中运行 Claude Code（tmux 或 screen）：

```bash
tmux new-session -s claude-remote
claude remote-control --name "Long Running Task"
# 按 Ctrl+B, D 分离
```

即使断开终端连接，会话仍会继续运行。

---

**下一章：** [第八章 — 安全与隐私](./08-security.md) — 在使用 Claude Code 时保护你的代码和凭据安全。
