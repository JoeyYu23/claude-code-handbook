# 第四章：安装

## 开始之前

安装是本书最"技术性"的部分——但它比看起来要简单得多。你只需要输入几条命令，然后就完成了。整个过程对大多数人来说不超过十分钟。

本章涵盖在 Mac、Windows 和 Linux 上的安装方法。直接跳到你的操作系统那一节。如果遇到任何问题，本章末尾的故障排查部分涵盖了最常见的问题。

---

## 你需要什么

**一个账号。** Claude Code 需要 Claude 订阅（Pro、Max、Teams 或 Enterprise），或者一个 Anthropic Console 账号（API 访问，需预充值信用额度）。如果你还没有，在开始之前先去 [claude.com](https://claude.com) 注册。免费的 Claude.ai 套餐不包含 Claude Code 访问权限。

**一个终端。** 这是你用来输入命令的文字界面。每台电脑都内置了一个：
- Mac：终端（在 Spotlight 里搜索"Terminal"，或者在"应用程序 > 实用工具"里找）
- Windows：PowerShell 或命令提示符（在开始菜单里搜索"PowerShell"）
- Linux：任何终端模拟器（通常按 Ctrl+Alt+T 打开）

**网络连接。** Claude Code 需要连接到 Anthropic 的服务器。

**4 GB 内存或以上。** 过去十年生产的几乎所有电脑都满足这个要求。

就这些。基础安装不需要其他软件。

---

## 在 Mac 上安装

Mac 安装是最简单的。打开你的终端，运行一条命令即可。

### 第一步：打开终端

按 Command + 空格打开 Spotlight 搜索，输入"Terminal"，然后按 Enter。一个窗口会出现，带着一个提示符——类似这样：

```
yourusername@MacBookPro ~ %
```

那个闪烁的光标在等你输入。

### 第二步：运行安装程序

精确复制粘贴这条命令，然后按 Enter：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

这条命令做了什么？它从 Anthropic 的服务器下载官方的 Claude Code 安装程序并运行它。你会看到一些下载安装过程中的输出，大致像这样：

```
Downloading Claude Code...
Installing to /Users/yourusername/.local/bin/claude
Installation complete!
Claude Code has been added to your PATH.
```

确切的输出可能有所不同。只要没有红色报错信息，一切就进展顺利。

### 第三步：验证安装

关闭你的终端窗口，打开一个新窗口（这确保你的系统识别到新安装）。然后输入：

```bash
claude --version
```

你应该看到打印出一个版本号，类似：

```
Claude Code 2.x.x
```

如果看到了，安装成功。继续第四步。

### 第四步：启动 Claude Code

导航到你想工作的文件夹（或者就停在你的主目录），然后输入：

```bash
claude
```

第一次运行时，Claude Code 会提示你登录。它会打开一个浏览器窗口，让你用 Claude 账号认证。按照提示操作，回到终端，你就进去了。

---

## 在 Windows 上安装

Windows 安装有两种方式。我们推荐原生 Windows 安装，在 PowerShell 或命令提示符里就能用。如果你是已经熟悉 WSL（Windows Subsystem for Linux）的开发者，那也完全可以。

### 第一步：安装 Git for Windows（必需）

Claude Code 需要 Git for Windows。如果你不确定是否已经安装了，很可能还没装。从这里下载安装：

```
https://git-scm.com/downloads/win
```

运行安装程序。安装过程中接受默认设置——你不需要改任何东西。安装完成后继续。

### 第二步：打开 PowerShell

点击开始菜单，输入"PowerShell"，然后点击"Windows PowerShell"。不需要以管理员身份运行。

### 第三步：运行安装程序

在 PowerShell 里运行：

```powershell
irm https://claude.ai/install.ps1 | iex
```

如果你更喜欢命令提示符而不是 PowerShell，用这个代替：

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

等待安装完成。你会在窗口里看到进度输出。

### 第四步：验证安装

关闭你的 PowerShell 窗口，打开一个新窗口。然后运行：

```powershell
claude --version
```

你应该看到一个版本号。如果看到了，继续下一步。

### 第五步：启动 Claude Code

导航到一个项目文件夹，然后输入：

```
claude
```

首次运行时，Claude Code 会打开浏览器窗口让你用 Claude 账号登录。完成登录并返回 PowerShell。

### 备选方案：WSL（Windows Subsystem for Linux）

如果你已经在用 WSL 并偏好 Linux 风格的环境，Claude Code 在那里运行得也很好。打开你的 WSL 终端，按照下一节的 Linux 安装说明操作。推荐 WSL 2（它也支持 Claude Code 的可选沙盒功能，提供增强的安全性）。

---

## 在 Linux 上安装

Linux 安装和 Mac 一样，用同一条命令。

### 第一步：打开终端

大多数 Linux 桌面可以从应用菜单访问终端，或者按 Ctrl+Alt+T。

### 第二步：运行安装程序

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

对于 **Ubuntu、Debian 和大多数主流发行版**，这条命令可以直接用。不需要额外的依赖。

对于 **Alpine Linux** 和其他基于 musl 的发行版，你需要先安装一些额外的包：

```bash
apk add libgcc libstdc++ ripgrep
```

然后再运行安装程序。

### 第三步：验证并启动

```bash
claude --version
claude
```

和 Mac 一样——确认你看到了版本号，然后启动 Claude Code 并在首次运行时登录。

---

## 备选安装方式：Homebrew（Mac/Linux）

如果你使用 Homebrew 作为包管理器，可以通过它安装 Claude Code：

```bash
brew install --cask claude-code
```

一个重要提示：Homebrew 安装**不会**自动更新。当 Claude Code 发布新版本时，你需要运行这条命令来更新：

```bash
brew upgrade claude-code
```

原生安装程序（上面的 `curl` 命令）在后台自动处理更新，这就是为什么我们向大多数人推荐它。

---

## 备选安装方式：WinGet（Windows）

如果你在 Windows 上使用 WinGet：

```powershell
winget install Anthropic.ClaudeCode
```

和 Homebrew 一样——WinGet 安装不会自动更新。定期运行 `winget upgrade Anthropic.ClaudeCode` 来保持最新版本。

---

## 背后发生了什么？

如果你好奇：安装程序把一个名为 `claude` 的程序放到了你终端能找到的文件夹里（Mac/Linux 上通常是 `~/.local/bin/claude`，Windows 上是类似的位置）。当你输入 `claude` 时，终端找到并运行这个程序。

Claude Code 把你的登录凭据和设置存储在 Mac/Linux 上的 `~/.claude` 文件夹里，或者 Windows 上的等效位置。你不需要进去那里，但知道它存在是好的。

---

## 常见问题故障排查

### "command not found: claude" 安装后出现

你的终端不知道在哪里找到 `claude` 程序。这通常意味着安装文件夹不在你系统的 PATH 里——也就是终端查找程序的位置列表。

**修复方法：** 完全关闭终端，打开一个新窗口。安装会更新 PATH，但这个改变只在新的终端会话里生效。

如果新开的终端还是显示这个错误，安装程序可能已经把 PATH 更新添加到了你的 shell 配置文件（比如 `~/.bashrc` 或 `~/.zshrc`），但你的终端没有读取它。尝试运行：

```bash
source ~/.bashrc    # 如果你使用 bash
source ~/.zshrc     # 如果你使用 zsh（新版 Mac 的默认）
```

然后再试 `claude --version`。

### 安装过程中出现"Permission denied"错误

**不要**对 Claude Code 安装程序使用 `sudo`。安装程序被设计为不需要提升权限。使用 `sudo` 可能导致权限问题。

如果你看到权限错误，通常意味着你的用户账号没有安装目录的写入权限。安装程序使用 `~/.local/bin`，它始终应该对你自己的账号可写。尝试注销并重新登录，然后再次运行安装程序。

### Windows 上出现"curl: command not found"

`curl` 命令可能在你的 Windows 版本里不可用。改用 PowerShell 命令：

```powershell
irm https://claude.ai/install.ps1 | iex
```

或者先安装 [Git for Windows](https://git-scm.com/downloads/win)，它包含了 curl。

### 登录没有打开浏览器窗口

Claude Code 尝试打开你的默认浏览器进行认证。如果没有浏览器打开：

1. 检查你的默认浏览器是否已设置。先尝试手动打开任何网站。
2. 查看终端——Claude Code 可能已经打印出了一个 URL。手动把那个 URL 复制粘贴到浏览器里。
3. 确保你有有效的网络连接。

### "Claude Code 在你的地区不可用"

Anthropic 的服务并非在所有国家都可用。查看 [anthropic.com/supported-countries](https://www.anthropic.com/supported-countries) 了解当前支持的地区列表。

### 安装成功但 Claude Code 首次启动非常慢

Claude Code 首次启动时会下载一些额外的组件。这是正常的，只会发生一次。之后的启动会很快。

### 获取更多帮助

如果你卡住了，运行这条命令——它会对你的安装进行诊断检查：

```bash
claude doctor
```

这会告诉你什么在正常工作，什么没有，通常还会建议如何修复问题。如果 `claude doctor` 本身不能工作，查看官方故障排查页面：[code.claude.com/docs/en/troubleshooting](https://code.claude.com/docs/en/troubleshooting)。

---

## 你进去了

一旦你在运行 `claude` 之后看到 Claude Code 的欢迎界面，你就拥有了所需的一切。难的部分已经完成。

在下一章里，我们会走过你与 Claude Code 的第一次对话——从打个招呼，到亲眼看它在你的电脑上创建真实的文件。

---

**下一章：** [第五章 — 第一次对话](./05-first-conversation.md) — 启动 Claude Code，提出你的第一个问题，看着它采取真实的行动。
