# 常见问题排查

Claude Code 最常见问题的解决方案。按类别组织。从你看到的错误信息开始，按照步骤操作。

---

## 认证问题

### "Not logged in"或"Authentication required"

**症状：** Claude Code 说你需要登录，或者当你运行 `claude` 时立即要求认证。

**解决方案：**
1. 在终端运行 `claude auth login`
2. 浏览器窗口会打开——完成登录
3. 回到终端；它应该确认你已登录
4. 再次尝试运行 `claude`

如果浏览器没有自动打开，Claude Code 会打印一个 URL。手动复制粘贴到浏览器中。

---

### "Authentication expired"或"Session invalid"

**症状：** Claude Code 之前能用，但现在说你的会话已过期。

**解决方案：**
1. 运行 `claude auth logout` 清除旧会话
2. 运行 `claude auth login` 重新登录
3. 在 claude.ai 检查你的账户状态——确保你的订阅是活跃的

---

### "API key not found"或"ANTHROPIC_API_KEY not set"

**症状：** 你在尝试直接用 API 密钥使用 Claude Code（而不是 Claude.ai 账户），但它找不到密钥。

**解决方案：**
1. 在终端设置环境变量：`export ANTHROPIC_API_KEY=your-key-here`
2. 要使其永久生效，将这行添加到你的 `~/.zshrc` 或 `~/.bashrc` 文件中
3. 编辑文件后，运行 `source ~/.zshrc`（或重启终端）

---

## 安装问题

### "claude: command not found"

**症状：** 你输入 `claude`，终端说这个命令不存在。

**解决方案：**

首先，检查 Claude Code 是否已安装：
```bash
which claude
ls ~/.claude/bin/
```

如果没有安装，安装它：
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

如果已安装但找不到命令，安装目录可能不在你的 PATH 中。添加它：
```bash
echo 'export PATH="$HOME/.claude/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

修改 PATH 后重启终端。

---

### Claude Code 安装后立即崩溃

**症状：** 运行 `claude` 在任何事情发生之前就报错，或者立即退出。

**解决方案：**
1. 检查 Node.js 是否已安装且是最新的：`node --version`（需要 18 或更高版本）
2. 尝试更新 Claude Code：`claude update`
3. 尝试全新重装：用卸载脚本卸载，然后用安装脚本重装
4. 查看错误信息——它通常会准确告诉你哪里出了问题

---

### 安装过程中出现"Permission denied"

**症状：** 安装脚本因权限错误而失败。

**解决方案：**
不要在 Claude Code 安装脚本中使用 `sudo`。原生安装程序设计为安装到你的 home 目录，不需要管理员权限。

如果你看到权限错误，检查：
1. 你对 `~/.claude/` 有写权限吗？
2. 你的 home 目录是否在只读文件系统上？
3. 尝试：`mkdir -p ~/.claude && chmod u+w ~/.claude`

---

## 运行时错误

### "Rate limit exceeded"

**症状：** Claude Code 在任务中途停止，出现关于速率限制或"too many requests"的消息。

**含义：** 你在短时间内发送了太多请求。这是 Anthropic API 为防止滥用而设置的限制。

**解决方案：**
1. 等待几分钟后重试
2. 对于长时间的自动化任务，考虑在请求之间添加暂停
3. 如果你经常遇到速率限制，在 console.anthropic.com 检查你的使用情况（如果使用 API 密钥计费）
4. Claude.ai 订阅用户有按账单周期重置的使用限额——查看你的使用量仪表板

---

### "Context length exceeded"或"Conversation too long"

**症状：** Claude Code 说对话太长了，或者在很长的会话后响应被截断或质量下降。

**含义：** 对话已超过 Claude 的上下文窗口——它无法再保存整个对话历史。

**解决方案：**
1. 运行 `/compact` 压缩对话历史。Claude 会总结较早的部分，同时保留最近的上下文。
2. 全新开始：运行 `/clear` 开始新对话（你需要重新建立上下文）
3. 对于大型代码库：每次会话专注于一个任务，而不是试图在一个很长的对话中完成所有事情
4. 避免反复粘贴大文件——改用 `@filename` 引用它们

---

### "Tool execution failed"或"Command failed"

**症状：** Claude Code 尝试运行一个命令，但失败了。

**解决方案：**
1. 读取错误信息——它通常会准确告诉你哪里失败了
2. 问 Claude："Why did that command fail? Can you try a different approach?"
3. 自己运行命令（使用 `!` 前缀）查看完整错误输出
4. 检查是否安装了所需工具：`which npm`、`which python` 等

---

### "File not found"或"No such file or directory"

**症状：** Claude Code 找不到它想要读取或编辑的文件。

**解决方案：**
1. 确保你在正确的目录中（`pwd` 检查）
2. 检查文件名或路径拼写是否正确
3. 问 Claude："What directory are you looking in? What files exist here?"
4. 运行 `ls` 或 `find . -name "filename"` 来定位文件

---

## 权限问题

### 编辑文件时出现"Permission denied"

**症状：** Claude Code 尝试编辑文件，但收到操作系统的权限拒绝错误。

**解决方案：**
1. 检查文件权限：`ls -la filename`
2. 使文件可写：`chmod u+w filename`
3. 如果文件属于 root 或其他用户，你可能需要 `sudo`——但在 Claude Code 中使用 `sudo` 要小心

---

### "Denied by permission rules"——Claude 拒绝做某事

**症状：** Claude Code 告诉你它不被允许执行某个特定操作，因为你的设置。

**解决方案：**
1. 运行 `/permissions` 查看当前的允许/拒绝规则
2. 找到阻止该操作的拒绝规则
3. 要么删除拒绝规则，要么添加一个更具体的允许规则
4. 检查你的用户设置（`~/.claude/settings.json`）和项目设置（`.claude/settings.json`）

---

### Claude 反复询问同一个命令的权限

**症状：** 你之前已经批准了 `npm run test`，但 Claude 在下一次会话中又问了。

**解决方案：**
将命令添加到你的允许列表，这样它就总是被批准：

在 `.claude/settings.json` 中：
```json
{
  "permissions": {
    "allow": ["Bash(npm run test)"]
  }
}
```

或者当 Claude 询问权限时，寻找"don't ask again"选项。

---

## VS Code 插件问题

### Claude Code 插件不可见

**症状：** 你安装了插件，但找不到火花图标。

**解决方案：**
1. 确保编辑器中有文件打开——工具栏图标只在有文件打开时出现
2. 检查 VS Code 版本：需要 1.98.0 或更高（Help → About）
3. 重启 VS Code：命令面板 → "Developer: Reload Window"
4. 尝试暂时禁用其他 AI 插件（Cline、Continue、GitHub Copilot）——它们有时可能冲突
5. 状态栏图标（右下角："✱ Claude Code"）即使没有文件打开也始终可见

---

### Claude Code 插件对提示没有响应

**症状：** 你输入提示，什么都没发生。

**解决方案：**
1. 检查网络连接
2. 开始一个新对话，排除会话过时的可能
3. 在 VS Code 的集成终端中尝试运行 `claude`——那里会显示更详细的错误
4. 重新安装插件：通过扩展面板卸载，重载 VS Code，重新安装

---

## Git 和 GitHub 问题

### 尝试创建 Pull Request 时出现"gh: command not found"

**症状：** Claude Code 无法创建 Pull Request，因为 `gh` CLI 未安装。

**解决方案：**
1. 安装 GitHub CLI：https://cli.github.com/
2. Mac：`brew install gh`
3. 安装后，认证：`gh auth login`
4. 再次尝试 Pull Request 命令

---

### "Remote origin not found"或"No remote configured"

**症状：** Claude Code 无法推送到 GitHub，因为没有配置远程仓库。

**解决方案：**
1. 先在 github.com 创建一个新仓库
2. 然后添加远端：`git remote add origin https://github.com/username/repo-name.git`
3. 或者告诉 Claude："Help me connect this project to a new GitHub repository"

---

### Git 显示"nothing to commit"

**症状：** 你让 Claude 提交，但 Git 说没有东西可以提交。

**含义：** 你所有的文件要么已经提交，要么被 `.gitignore` 排除了。

**解决方案：**
1. 运行 `git status` 查看 Git 能看到什么
2. 如果你有 Git 没有追踪的新文件，运行 `git add .` 来暂存它们
3. 问 Claude："What is the current git status? Why does it say nothing to commit?"

---

## CLAUDE.md 问题

### Claude 没有遵循 CLAUDE.md 中的指令

**症状：** 你在 CLAUDE.md 中有指令，但 Claude 似乎在忽略它们。

**解决方案：**
1. 运行 `/memory` 验证 CLAUDE.md 文件确实被加载了——如果加载了，它会在列表中显示
2. 确保文件在正确位置：`./CLAUDE.md` 或 `./.claude/CLAUDE.md`
3. 让指令更具体："Use 2-space indentation"比"write clean code"效果更好
4. 将文件控制在 200 行以内——更长的文件遵循率更低
5. 检查矛盾：两条规则说不同的事可能会相互抵消

---

### CLAUDE.md 的更改没有生效

**症状：** 你编辑了 CLAUDE.md，但 Claude 似乎在使用旧版本。

**解决方案：**
1. 开始一个新的 Claude Code 会话——CLAUDE.md 在每次会话开始时读取
2. 运行 `/memory` 确认加载的是哪个版本
3. 确保在开始会话前已保存文件

---

## 性能和响应缓慢

### Claude Code 响应非常慢

**症状：** 响应需要 30 秒或更长时间；感觉很迟钝。

**可能的原因和解决方案：**
1. **需求量高：** Anthropic 的服务器可能负载很高。等几分钟后重试。
2. **对话非常长：** 使用 `/compact` 压缩历史。长对话会拖慢速度。
3. **上下文中有大文件：** 避免不必要地让 Claude 在内存中保留非常大的文件。
4. **网络问题：** 检查你的网络连接。尝试 `ping claude.ai`。

---

### Claude Code 在会话中间"忘记"东西

**症状：** Claude 停止引用它在同一对话早些时候知道的上下文。

**含义：** 对话可能已经自动压缩（Claude 总结了较旧的消息以释放上下文空间）。

**解决方案：**
1. 提醒 Claude 关键上下文："Earlier in this session you were working on X. Here's a quick summary of where we are..."
2. 将重要事实放在 CLAUDE.md 中，这样它们在压缩后仍然保留
3. 在开始一个新的主要任务之前手动使用 `/compact`，按你的时间节点压缩

---

## 获取更多帮助

如果以上方法都解决不了你的问题：

1. **直接问 Claude：** "I'm having trouble with [description]. What should I try?" Claude 可以访问自己的文档，可以帮助排查自身的问题。

2. **查看官方文档：** https://code.claude.com/docs

3. **提交问题：** 对于 Bug，GitHub 仓库 https://github.com/anthropics/claude-code 接受详细的错误报告。

4. **社区：** Claude Code 开发者社区在在线论坛和 Discord 服务器中分享技巧和解决方案——搜索"Claude Code community"。

---

*发现这里没有列出的问题？第十二章的调试思维方式同样适用：精确描述症状，记录你已经尝试过的内容，并用 Claude 本身来帮助诊断问题。*
