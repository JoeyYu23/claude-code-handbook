# 第二十一章：远程连接

> 从手机或任何浏览器继续你的本地 Claude Code session——Remote Control 功能详解。

---

## 远程连接是什么？

**Remote Control** 是 Claude Code 的一项功能，让你可以从任意设备（手机、平板、另一台电脑的浏览器）连接并控制你本地机器上运行的 Claude Code session。

这与"云端 Claude Code"不同：

```
Remote Control（远程连接）：
本地机器 ←→ Anthropic API ←→ 手机/浏览器
  ↑                                   ↑
  代码在这里运行              你在这里输入

Claude Code on the Web（云端）：
Anthropic 云服务器 ←→ 浏览器
  ↑                      ↑
  代码在这里运行    你在这里输入（无本地环境）
```

**核心优势**：Remote Control 保留了本地环境的全部能力——你的文件系统、MCP servers、本地工具、代码都在本机运行，只是交互界面可以在任何地方。

---

## 版本和权限要求

```bash
# 确认版本（需要 v2.1.51+）
claude --version

# 升级到最新版本
curl -fsSL https://claude.ai/install.sh | bash
```

Remote Control 需要：
- Claude Pro/Max/Team/Enterprise 订阅（不支持纯 API key）
- 用 `/login` 登录 claude.ai 账号
- 在项目目录中运行过一次 `claude`（接受工作区信任提示）

---

## 设置远程访问

### 方式一：服务器模式（无人值守任务）

```bash
cd ~/projects/my-app

# 启动专用远程控制服务器
claude remote-control

# 加上自定义名称方便识别
claude remote-control --name "My App - 后端重构"
```

启动后终端会显示：

```
Remote Control session started.
Session URL: https://claude.ai/code/sessions/abc123

Press SPACE to show QR code for mobile access.
Press Q to quit.

Waiting for remote connection...
```

用手机扫描二维码或在浏览器打开 URL，即可开始远程操作。

### 方式二：交互模式（边本地工作边远程可访问）

```bash
# 启动一个同时支持本地和远程控制的 session
claude --remote-control

# 或简写
claude --rc "My Project"
```

这种模式下，本地终端和远程浏览器/手机可以同时发送消息，session 保持同步。

### 方式三：为已有 session 启用远程控制

如果你正在一个 session 里工作，临时需要远程访问：

```
/remote-control
# 或
/rc My Project
```

---

## SSH 隧道（高级用法）

对于不希望流量经过 Anthropic 服务器的场景，可以用 SSH 隧道配合本地 HTTP 传输：

```bash
# 在远程服务器上启动 Claude Code
ssh user@my-server.com

# 在服务器上启动 Claude Code MCP server 模式
claude mcp serve --port 8080

# 在本地建立 SSH 隧道
ssh -L 8080:localhost:8080 user@my-server.com -N &

# 本地 Claude Code 通过隧道连接远程 session
# （高级场景，通常不需要）
```

---

## 跨机器工作

### 场景一：工位 → 家里继续工作

```bash
# 工位上（下班前）
cd ~/projects/my-app
git add -A && git commit -m "wip: in progress work"
git push

# 启动 Remote Control 服务器（让它在后台继续运行）
claude remote-control --name "工作中的重构任务" &
```

在家里，打开 claude.ai/code，找到"工作中的重构任务" session，继续工作——本地机器的 MCP server、工具、文件系统全部可用。

### 场景二：电脑 → 手机查看进度

```bash
# 启动一个长时间任务
claude --rc "跑完整测试套件并修复所有失败的测试"
```

然后在手机上查看进度，在 Claude 需要你决策时及时回复，不需要守在电脑前。

### 场景三：多设备并行 session（服务器模式 + worktree）

```bash
# 使用 worktree 模式，每个远程连接获得独立工作目录
claude remote-control --spawn worktree --name "开发团队共享环境"
```

团队成员可以各自连接，在独立的 git worktree 上工作，互不干扰。

### 为所有 session 默认启用远程控制

```
# 在 Claude Code 中执行
/config
# 找到 "Enable Remote Control for all sessions" 设置为 true
```

---

## 安全考虑

Remote Control 的安全设计要点：

### 流量路径

```
本地机器 → HTTPS → Anthropic API → HTTPS → 你的设备
```

- 只有出站 HTTPS 连接，本机不开放任何端口
- 所有流量通过 TLS 加密传输
- 使用多个短期凭证，每个凭证只有特定用途，独立过期

### 访问控制

- 只有登录相同 claude.ai 账号的设备才能访问你的 session
- Team/Enterprise 用户需要管理员先在后台启用 Claude Code 功能
- 在 claude.ai/settings 中可以查看和管理所有活跃的远程 session

### 最佳实践

```markdown
远程连接安全清单：
□ 确认你的 claude.ai 账号使用强密码和 2FA
□ 在公共 WiFi 上使用时，确认连接是 HTTPS
□ 不需要时关闭 Remote Control（Ctrl+C 结束服务器进程）
□ 不要在共享的浏览器或设备上登录 claude.ai
□ Team 账号：定期检查 admin 面板中的活跃 session 列表
```

---

## 连接问题排查

### 问题：手机无法打开 Session URL

```bash
# 检查本地 Claude Code 版本
claude --version  # 需要 >= 2.1.51

# 检查是否已登录
claude auth status

# 重新登录
claude /login
```

### 问题：Session 显示离线（灰色）

Remote Control 需要本地机器保持联网且 `claude` 进程在运行。
- 检查本地终端中 claude 进程是否还在运行
- 网络断开超过约 10 分钟后，session 会超时退出，需要重新启动

### 问题：远程操作延迟高

Remote Control 的响应时间受以下因素影响：
- 本地机器网络带宽（出站）
- Anthropic API 的响应时间
- 你的设备网络质量

调试步骤：

```bash
# 检查本地网络
curl -w "@curl-format.txt" -o /dev/null -s "https://api.anthropic.com"

# 启动时开启详细日志
claude remote-control --verbose
```

### 问题：OAuth 回调失败

```
If browser redirect fails with connection error:
1. Copy the full URL from browser address bar
2. Paste it back into Claude Code when prompted
```

---

## Remote Control vs Claude Code on the Web

| 维度 | Remote Control | Claude Code on the Web |
|------|--------------|----------------------|
| 代码在哪里运行 | 你的本地机器 | Anthropic 云服务器 |
| 本地文件访问 | 完整访问 | 只能访问 clone 的 repo |
| 本地 MCP servers | 可用 | 不可用 |
| 适合场景 | 继续本地任务 | 无本地环境时启动新任务 |
| 网络断开影响 | session 超时 | 无影响 |
| 并发 session | 取决于本机性能 | 可以更多 |

两者都通过 claude.ai/code 界面操作，外观一致，只是运行环境不同。

---

**下一章：** [安全与隐私](./22-security.md)
