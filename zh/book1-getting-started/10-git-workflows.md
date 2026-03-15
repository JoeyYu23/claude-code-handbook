# 第十章：Git 工作流

## Git 是什么？为什么每个开发者都要用它？

如果你刚开始接触编程，Git 这个名字可能让你觉得陌生。简单说：

**Git 是一个"代码时光机"。**

它会记录你对代码做的每一次修改，让你可以：
- 随时回到过去的任何版本
- 在不同功能之间切换（分支）
- 和他人协作，合并各自的改动
- 出了问题，找到是谁、什么时候、改了什么

对于任何超过一个文件的项目，用 Git 几乎是必须的。Claude Code 与 Git 深度集成，可以帮你处理大部分 Git 操作。

---

## 提交更改（Commit）

### 什么是 commit？

Commit（提交）就是把你的修改"存档"。每次提交都会生成一个快照，记录：
- 改了什么文件
- 删除了什么、添加了什么
- 这次改动的原因（commit message）

### 让 Claude 帮你提交

```
帮我把刚才的修改提交到 Git
```

Claude 会自动：
1. 运行 `git status` 检查有哪些修改
2. 运行 `git add` 暂存相关文件
3. 写一条符合规范的 commit message
4. 运行 `git commit`

**Claude 写的 commit message 是什么风格？**

Claude Code 遵循 Conventional Commits 规范，格式是：

```
类型: 简短描述（不超过 72 个字符）

[可选的详细说明]
```

类型包括：
- `feat:` — 新功能
- `fix:` — 修复 bug
- `refactor:` — 重构代码
- `docs:` — 文档变更
- `test:` — 测试相关
- `chore:` — 构建配置等杂项

**示例：**

```
feat: add email validation with regex pattern

Replace the simple @-check with RFC-compliant regex to catch
malformed addresses before form submission.
```

这比 "改了点东西" 强多了，对吧？

### 提交前你可以指定说明

```
帮我提交，说明这次改动是"修复了登录时密码错误提示不显示的 bug"
```

Claude 会用你提供的信息写一条语义清晰的 commit message。

---

## 创建分支（Branch）

### 什么是分支？

想象你正在修一条路，但修路期间不能断交通。分支就是这条路旁边开辟的一条"施工便道"——你在上面随便折腾，完成后再并回主路。

每个独立功能或 bug 修复，建议都在一个单独的分支上完成。

### 让 Claude 帮你创建分支

```
帮我创建一个新分支，用来开发用户注册功能
```

Claude 会运行：

```bash
git checkout -b feature/user-registration
```

命名规范：
- 新功能：`feature/功能名`
- Bug 修复：`fix/问题描述`
- 实验性工作：`experiment/内容`

### 切换分支

```
帮我切换回主分支（main/master）
```

```
我现在在哪个分支上？帮我看一下所有的分支。
```

---

## 查看 Diff（差异）

在提交或合并之前，你可能想先看看改了什么。

```
帮我看一下我还没提交的改动
```

Claude 会运行 `git diff` 并用通俗语言解释每处改动：

```
以下是未提交的改动：

src/auth/login.js
  - 第 23 行：把 timeout 值从 3000 改为 5000
  - 第 41-48 行：新增了错误日志记录

src/config/app.js
  - 第 7 行：更新了 API 版本号
```

### 看提交历史

```
帮我看一下最近 10 次提交记录
```

```
这个文件是什么时候被修改的？谁改的？
```

---

## 用 GitHub 创建 Pull Request

Pull Request（PR）是团队协作的核心工具——你在自己的分支上完成开发后，通过 PR 请求把它合并到主分支，同时让团队成员审查代码。

### 前提：安装 gh（GitHub CLI）

```bash
# Mac
brew install gh

# 然后登录
gh auth login
```

### 让 Claude 帮你创建 PR

```
帮我在 GitHub 上创建一个 pull request，
把 feature/user-registration 合并到 main
```

Claude 会：
1. 运行 `git push origin feature/user-registration` 推送分支
2. 运行 `gh pr create`，自动填写：
   - PR 标题（基于你的 commits）
   - PR 描述（解释做了什么、为什么这么做）
   - 目标分支

### 让 Claude 写 PR 描述

好的 PR 描述让审查者一眼明白你做了什么。你可以让 Claude 帮你写：

```
帮我写一个 PR 描述，说明这次我实现了用户注册功能，
包括：邮箱格式验证、密码强度检查、发送确认邮件。
```

---

## 常见 Git 场景

### 场景一：搞乱了，想回到之前的状态

```
我改坏了，想把文件恢复到上次提交时的状态
```

```
帮我撤销最近这次提交（但保留文件改动）
```

```
帮我彻底撤销最近这次提交（包括文件改动）
```

Claude 会选择合适的 Git 命令：
- `git checkout -- 文件名` — 撤销文件未提交的改动
- `git reset --soft HEAD~1` — 撤销最近一次提交，保留改动
- `git reset --hard HEAD~1` — 彻底撤销（谨慎使用）

### 场景二：合并冲突

当两个人修改了同一个文件的同一部分，Git 不知道该保留哪个，就会产生"合并冲突"。文件里会出现这样的标记：

```
<<<<<<< HEAD
function validate(email) {
  return email.includes('@');
}
=======
function validate(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
>>>>>>> feature/strict-validation
```

你可以让 Claude 帮你解决：

```
我遇到了合并冲突，帮我看一下应该保留哪个版本，或者怎么合并两个版本。
```

Claude 会解释两个版本的区别，然后提出合并建议。

### 场景三：搞清楚项目历史

```
帮我找一下，是什么时候引入了这个 bug？
（给出 bug 的描述或代码片段）
```

Claude 可以用 `git log`、`git blame` 等命令追踪变更历史，帮你找出是哪次提交引入了问题。

### 场景四：暂存当前工作，去做别的事

```
我正在开发新功能，但需要临时切换去修一个 bug，
帮我先把当前的改动保存一下，等修完 bug 再回来继续。
```

Claude 会用 `git stash` 帮你暂时保存当前的改动，切换分支处理 bug，然后用 `git stash pop` 恢复。

### 场景五：查看某个文件的改动历史

```
src/auth/login.js 这个文件最近被改过几次？每次改了什么？
```

Claude 会运行 `git log --follow src/auth/login.js`，列出这个文件所有的修改记录。

---

## Git 工作流的好习惯

经过这一章，你已经了解了 Claude Code 与 Git 的配合方式。以下是几个建议：

**1. 勤提交**
不要攒很久才提交。每完成一个小功能点，就提交一次。小的提交更容易回滚和追踪。

**2. 提交信息要有意义**
"改了一些东西" 毫无价值。"fix: resolve timeout in auth when network is slow" 则清晰传达了做了什么、为什么。

**3. 用分支隔离工作**
主分支（main/master）保持稳定。新功能开分支，完成后再合并。

**4. 推送前检查**
让 Claude 帮你 `git diff HEAD` 看一遍要推送的内容，避免意外推上去不该推的东西（比如调试用的代码、密钥）。

**5. Pull Request 前自己先复查**
让 Claude 帮你把 PR 里的改动都列出来，你自己先过一遍，再提交给队友审查。

---

## 小结

- **Commit**：用 Claude 一键提交，自动生成规范的 commit message
- **Branch**：每个功能开独立分支，Claude 帮你创建和切换
- **PR**：用 Claude + gh CLI 自动创建 Pull Request，填写高质量描述
- **Diff**：随时请 Claude 解释你改了什么
- **问题处理**：冲突、撤销、历史追踪，Claude 都能辅助

Git 的核心价值是**让代码有历史记录、让错误可以回滚**。Claude Code 让这一切变得更容易操作，让你可以专注于写代码本身。

---

**下一章：** [从零搭一个网站](./11-build-website.md)
