# 附录 B：常见问题与解决方案

本附录收录了 Claude Code 使用过程中最常遇到的问题，以及经过验证的解决方案。

---

## 安装和启动问题

### Q1：运行 `claude` 后提示"command not found"

**症状：**
```
zsh: command not found: claude
```

**原因：** Claude Code 没有安装，或者安装路径没有加入系统 PATH。

**解决方案：**

方案 A — 重新安装：
```bash
# macOS/Linux
curl -fsSL https://claude.ai/install.sh | bash
```

方案 B — 手动检查安装：
```bash
# 检查 claude 命令在哪里
which claude
ls ~/.local/bin/claude

# 如果文件存在但命令找不到，重新加载 shell 配置
source ~/.zshrc    # macOS (zsh)
source ~/.bashrc   # Linux (bash)
```

方案 C — 用 Homebrew：
```bash
brew install --cask claude-code
```

---

### Q2：启动后卡在登录界面，无法完成认证

**症状：** 浏览器打开了登录页面，但完成后 Claude Code 没有反应。

**解决方案：**

1. 确认网络连接正常
2. 关闭 Claude Code（`Ctrl+C`），重新运行 `claude`
3. 如果公司有 VPN 或防火墙，尝试断开后重试
4. 清除 Claude Code 的认证缓存：
```bash
rm -rf ~/.claude/.auth*
```
然后重新运行 `claude` 进行登录。

---

### Q3：VS Code 插件安装后看不到 Claude 图标

**症状：** 安装了扩展，但编辑器里找不到 Claude Code 的图标或面板。

**解决方案：**

1. 确认已打开至少一个文件（只打开文件夹不够，编辑器工具栏的图标需要有文件打开）
2. 尝试重载 VS Code：按 `Cmd+Shift+P`，输入 "Reload Window"
3. 检查 VS Code 版本，需要 1.98.0 或更高
4. 在状态栏右下角找 "✱ Claude Code"（这个位置始终可见，不需要文件）
5. 如果有其他 AI 扩展（Cline、Continue 等），尝试临时禁用它们

---

### Q4：Claude Code 很慢，响应需要很长时间

**可能原因及解决方案：**

- **网络问题：** 检查网络连接，或尝试更换 DNS
- **项目太大：** 避免在极大的代码库（数万个文件）里不加过滤地让 Claude 扫描全部文件
- **上下文太长：** 运行 `/compact` 压缩当前对话上下文
- **服务繁忙：** Anthropic 服务有时会有延迟，稍等再试

---

## 对话和功能问题

### Q5：Claude 不遵守 CLAUDE.md 里的规则

**症状：** 明明在 CLAUDE.md 里写了规则，但 Claude 好像没有看到。

**解决方案：**

1. 运行 `/memory` 确认你的 CLAUDE.md 出现在加载的文件列表里
2. 检查文件位置是否正确：
   - 项目级：`./CLAUDE.md` 或 `./.claude/CLAUDE.md`
   - 用户级：`~/.claude/CLAUDE.md`
3. 让规则更具体：
   - 模糊："正确格式化代码"
   - 具体："使用 2 空格缩进，不用 Tab"
4. 检查 CLAUDE.md 有没有相互矛盾的规则
5. 文件如果超过 200 行，效果会下降，考虑拆分或精简

---

### Q6：对话历史很长后，Claude 开始"忘记"之前说过的内容

**症状：** 之前明确说过某个要求，后来 Claude 好像不知道了。

**原因：** 对话超出了上下文窗口长度，早期内容被压缩了。

**解决方案：**

1. 重要的规则写进 CLAUDE.md，而不是只在对话里说
2. 手动运行 `/compact` 压缩对话，让 Claude 保留关键信息
3. 开始新对话前，用 `/clear` 清空历史，在新对话开头重申关键要求

---

### Q7：Claude 修改了我不想让它修改的文件

**解决方案：**

事后补救：
```bash
# 查看哪些文件被修改
git status

# 恢复特定文件
git checkout -- 文件路径

# 或者让 Claude 帮你恢复
# 在对话里说："把 xxx 文件改回之前的版本"
```

事前预防：
- 在 CLAUDE.md 里明确列出不应修改的文件
- 使用默认模式（每次确认），不要用自动接受模式处理重要项目
- 在 `.claude/settings.json` 的 `deny` 列表里加入敏感文件：
```json
{
  "permissions": {
    "deny": [
      "Edit(./.env)",
      "Edit(./prisma/schema.prisma)"
    ]
  }
}
```

---

### Q8：Claude 在改代码时产生了语法错误

**解决方案：**

1. 直接告诉 Claude：
   ```
   刚才的修改让代码报了语法错误，帮我修复：
   [粘贴错误信息]
   ```

2. 让 Claude 自检：
   ```
   改完之后先帮我检查一下有没有语法问题
   ```

3. 用 Git 回滚后重新尝试：
   ```bash
   git checkout -- 文件路径
   ```

---

### Q9：运行命令时出现权限错误

**症状：**
```
Error: EACCES: permission denied
```

**解决方案：**

对于 npm 全局安装权限问题：
```bash
# 修改 npm 全局目录的权限（推荐方式）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 然后把 ~/.npm-global/bin 加入 PATH
```

对于其他权限问题，不要用 `sudo npm install`——这会引起更多问题。让 Claude 帮你分析具体的权限错误，找到正确的解决方法。

---

### Q10：Claude Code 的 Auto Memory 保存了错误的信息，如何删除？

**解决方案：**

1. 运行 `/memory` 打开记忆管理界面，找到相关文件并打开编辑
2. 或者直接在文件系统里编辑：
   ```bash
   # 打开 memory 文件所在目录
   open ~/.claude/projects/
   ```
3. 找到对应项目的 `MEMORY.md` 或相关主题文件，用文本编辑器删除错误内容
4. 也可以直接告诉 Claude：
   ```
   你之前记录的 "项目用 npm" 是错的，我们用 pnpm。
   帮我更新一下记忆文件。
   ```

---

## Git 相关问题

### Q11：Claude 提交了我不想提交的内容（比如调试代码）

**解决方案：**

如果只是最近一次提交，可以撤销：
```bash
# 撤销最近一次提交（保留文件改动）
git reset --soft HEAD~1

# 然后选择性地暂存和提交
git add 你想提交的文件
git commit -m "提交信息"
```

如果已经推送到远程，情况更复杂，建议让 Claude 根据你的具体情况给出方案。

**预防：** 提交前让 Claude 帮你检查：
```
帮我在提交前检查一下，有没有调试代码（console.log 等）
或者不应该提交的内容。
```

---

### Q12：出现 Git 合并冲突，不知道如何解决

**解决方案：**

把冲突的文件内容展示给 Claude：
```
出现了合并冲突，帮我解决：
[粘贴包含冲突标记的文件内容]

<<<<<<< HEAD
[现有代码]
=======
[另一个分支的代码]
>>>>>>> feature-branch
```

Claude 会解释两个版本的区别，并建议保留哪个版本或如何合并。

---

## 项目相关问题

### Q13：Claude 误解了我的需求，做了很多不对的改动，如何快速恢复？

**解决方案（按情况选择）：**

1. **用 Git 撤销所有未提交改动（核弹按钮）：**
   ```bash
   git checkout .
   ```
   这会把所有文件恢复到上次 commit 的状态。

2. **用 VS Code 检查点回滚：**
   在对话里把鼠标悬停到出错前的那条消息，选择"Rewind code to here"。

3. **让 Claude 纠错：**
   ```
   你刚才做的改动偏了，主要问题是 [描述问题]。
   请帮我把这些改动撤销，我们重新从 [某个具体点] 开始。
   ```

---

### Q14：Claude 在大型项目中响应变慢，且理解出现偏差

**原因：** 大型项目有很多文件，Claude 需要处理大量上下文，可能导致效率下降。

**解决方案：**

1. 写一个好的 CLAUDE.md，清晰描述项目架构，帮 Claude 快速定位
2. 在提问时指定具体文件，而不是让 Claude 自己去找：
   ```
   请查看 src/auth/login.js，解释里面的 verifyToken 函数
   ```
3. 一次只做一件事，避免大而全的任务
4. 定期运行 `/compact` 压缩对话上下文

---

### Q15：如何让 Claude Code 更新到最新版本？

**方案（取决于安装方式）：**

通过官方安装脚本安装的（推荐，自动更新）：
```bash
# 自动更新，通常无需手动操作
# 如果想立即更新：
claude update
```

通过 Homebrew 安装的：
```bash
brew upgrade claude-code
```

通过 WinGet 安装的（Windows）：
```powershell
winget upgrade Anthropic.ClaudeCode
```

查看当前版本：
```bash
claude --version
```

---

*遇到本附录未涵盖的问题？可以直接问 Claude Code，或者访问 Anthropic 官方社区寻求帮助。*
