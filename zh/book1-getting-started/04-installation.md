# 第四章：安装教程

## 在开始之前

安装 Claude Code 比大多数软件都简单——通常只需要一条命令。但在此之前，我们需要确认几件事。

### 你需要什么？

**1. 一个 Claude 账号**

Claude Code 需要登录才能使用。你可以用以下任一方式：
- **Claude 付费订阅**（Pro、Max、Teams 或 Enterprise）——推荐，开箱即用
- **Anthropic Console 账号**——开发者 API 账号，按使用量计费

如果你还没有账号，去 [claude.ai](https://claude.ai) 注册一个。免费注册，付费方案从 Pro 开始。

**2. 终端（Terminal）**

你需要能打开终端（命令行窗口）：
- **Mac**：在 Spotlight 搜索"Terminal"或打开"终端.app"
- **Windows**：搜索"PowerShell"或"命令提示符"（更推荐使用 WSL，见下方）
- **Linux**：你大概已经很熟悉终端了

**3. 网络连接**

安装过程需要下载文件。

---

## Mac 安装（推荐方式）

Mac 上安装 Claude Code 最简单，用一条命令搞定。

### 第一步：打开终端

按 `Command + 空格`，输入"Terminal"，回车。你会看到一个窗口，里面有一个光标在等待你输入。

### 第二步：运行安装命令

在终端里输入以下命令（可以直接复制粘贴），然后按回车：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

你会看到一些滚动的文字，表示正在下载和安装。正常情况下整个过程不超过一两分钟。

**预期输出大致如下：**

```
Downloading Claude Code...
Installing to /usr/local/bin/claude...
Installation complete!
Run 'claude' to get started.
```

### 第三步（可选）：用 Homebrew 安装

如果你已经安装了 Homebrew（Mac 上流行的包管理器），也可以用：

```bash
brew install --cask claude-code
```

> **注意：** Homebrew 安装的版本不会自动更新。如果你想始终用最新版，建议用第一步的方式，或者定期运行 `brew upgrade claude-code`。

### 验证安装成功

安装完成后，输入：

```bash
claude --version
```

如果看到版本号（比如 `Claude Code 1.x.x`），说明安装成功了。

---

## Windows 安装

Windows 有三种安装方式，我们推荐按以下顺序考虑：

### 方式一：原生安装（PowerShell）

打开 **PowerShell**（在开始菜单搜索），输入：

```powershell
irm https://claude.ai/install.ps1 | iex
```

> **注意：** Windows 安装需要先安装 **Git for Windows**。如果你还没装，去 [git-scm.com/downloads/win](https://git-scm.com/downloads/win) 下载安装，然后再运行上面的命令。

### 方式二：WinGet 安装

如果你的 Windows 10/11 有 winget（Windows 包管理器），可以用：

```powershell
winget install Anthropic.ClaudeCode
```

### 方式三：WSL（Windows Subsystem for Linux）——推荐给想深度使用的用户

WSL 让你在 Windows 上运行一个 Linux 环境。这是更接近"专业开发者"工作方式的选择，也能给你更流畅的 Claude Code 体验。

**启用 WSL 的步骤：**

1. 以管理员身份打开 PowerShell
2. 运行：
   ```powershell
   wsl --install
   ```
3. 重启电脑
4. 打开"Ubuntu"应用（安装后会出现在开始菜单）
5. 在 Ubuntu 终端里，运行 Mac/Linux 的安装命令：
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

> **给完全没用过 WSL 的新手：** 安装 WSL 不会影响你正常使用 Windows。它就像在 Windows 里装了一个"小 Linux 房间"，你可以随时进去用，随时出来。

---

## Linux 安装

在 Linux 上，和 Mac 使用相同的命令：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

这个命令支持 Ubuntu、Debian、Fedora、Arch 等主流发行版。

---

## 首次启动和登录认证

安装好之后，进入你想要工作的文件夹，然后输入：

```bash
claude
```

**第一次运行时，Claude Code 会引导你登录。** 大致流程是：

1. 终端里显示登录提示
2. 你选择登录方式（Claude 账号 / Anthropic Console）
3. 浏览器自动打开，引导你完成授权
4. 授权完成后，回到终端，登录状态会被保存

**登录成功后，你会看到欢迎界面**，里面有你的账号信息、最近的对话记录，以及输入框等待你的第一条消息。

以后每次启动不需要重新登录，凭证会安全地保存在你的电脑上。

---

## 常见问题排查

### 问题一："command not found: claude"

**症状：** 输入 `claude` 后，终端说找不到这个命令。

**原因：** 安装路径没有被终端识别到。

**解决方法：**

关闭终端，重新打开一个新的终端窗口，再试一次。通常重启终端后路径就能被识别到了。

如果还不行，在终端里运行：
```bash
source ~/.bashrc
# 或者，如果你用 zsh（Mac 默认）：
source ~/.zshrc
```

### 问题二：Mac 上提示"无法验证开发者"

**症状：** macOS 弹出一个安全提示，说无法验证这个程序。

**解决方法：**

打开"系统设置" → "隐私与安全性" → 找到相关提示 → 点击"仍然允许"。

这是 macOS 对非 App Store 软件的标准提示，Claude Code 是安全的。

### 问题三：Windows 上显示"在此系统上禁止运行脚本"

**症状：** PowerShell 说脚本被禁止运行。

**解决方法：**

以管理员身份打开 PowerShell，运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后再运行安装命令。

### 问题四：安装成功但登录失败

**可能原因：** 网络问题（特别是在中国大陆，可能需要 VPN）；或者账号未付费。

**解决方法：**
- 确认你有可用的网络连接，能正常访问 claude.ai
- 确认你的账号是付费订阅（免费账号不支持 Claude Code）
- 如果在中国大陆，需要使用 VPN

### 问题五：不知道怎么打开终端

**Mac：** `Command + 空格` 打开 Spotlight，输入"Terminal"或"终端"，回车。

**Windows：** 按 `Windows 键`，输入"PowerShell"，右键选择"以管理员身份运行"。

**Linux（Ubuntu）：** `Ctrl + Alt + T` 打开终端。

---

## 更新 Claude Code

**原生安装（推荐方式）** 会在后台自动更新，你不需要手动操作。

**Homebrew 安装**：
```bash
brew upgrade claude-code
```

**WinGet 安装**：
```powershell
winget upgrade Anthropic.ClaudeCode
```

---

## 卸载 Claude Code

如果你想卸载：

**原生安装（Mac/Linux）**：
```bash
# 找到安装位置
which claude
# 删除（以实际路径为准）
rm /usr/local/bin/claude
```

**Homebrew**：
```bash
brew uninstall --cask claude-code
```

**WinGet**：
```powershell
winget uninstall Anthropic.ClaudeCode
```

---

## 安装完成！

如果你看到了欢迎界面，说明一切就绪。接下来，我们要开始第一次对话——让 Claude Code 帮你做点实际的事情。

---

**下一章：** [第一次对话](./05-first-conversation.md)
