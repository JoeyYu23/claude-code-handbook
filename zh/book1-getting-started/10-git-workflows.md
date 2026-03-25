# 第十章：Git 工作流

## 为什么 Git 很重要（快速入门）

如果你是开发新手，这里有一些基本背景：Git 是一个版本控制系统。它让你能追踪代码的每一次改动历史，回到任意一个之前的版本，同时开发多个功能而互不干扰，以及与他人协作而不会互相覆盖对方的工作。

把 Git 想象成代码的"高级版修订记录"。每次你在 Git 中"提交（commit）"，就是在为你的项目拍一张快照。这些快照构成了一段历史，你可以浏览、从中创建分支，以及合并在一起。

几乎每个真实项目都使用 Git。如果你今天的项目还没有用 Git，本章会说服你开始用。

Claude Code 非常擅长处理 Git。它能写出好的提交信息，干净地管理分支，甚至可以帮你创建 Pull Request。让我们来看看最常见的几种场景。

---

## 提交更改

最基本的 Git 操作是提交——将你的改动保存为一个快照，并附上描述。

传统方式需要自己运行 git 命令、编写提交信息、暂存正确的文件。Claude Code 帮你处理这一切：

```
Commit the changes I have made
```

Claude 会：
1. 运行 `git status` 查看发生了什么变化
2. 审查改动以了解做了什么
3. 暂存合适的文件
4. 编写一条描述性的提交信息
5. 创建提交

Claude 编写的提交信息质量很高。不是含糊的"fix stuff"或"update files"，而是能解释改动目的的信息：

```
fix: validate email format before saving to database

The previous validation only checked for an @ symbol, which allowed
invalid addresses through. Updated to use RFC-compliant regex that
requires a valid domain with proper structure.
```

这种详细的提交信息在几个月后你试图理解为什么做了某个改动时非常有价值。

**提交特定文件：**

如果你只想提交部分改动：

```
Commit only the changes to the authentication module, not the UI changes
```

Claude 只会暂存相关文件，其余文件保持未暂存状态。

---

## 创建分支

当你在开发新功能或修复 bug 时，最佳实践是创建一个独立的分支。这样能将你的工作与主代码库隔离，直到准备好合并。

```
Create a new branch for adding the user profile feature
```

Claude 会：
1. 选择一个合理的分支名称（比如 `feature/user-profile`）
2. 创建分支
3. 切换到该分支
4. 确认你已在新分支上

你也可以自己指定名称：

```
Create a branch called feature/payment-integration
```

**查看当前分支：**

```
What branch am I on, and what branches exist?
```

Claude 会运行 `git branch` 并清楚地告诉你当前位置和其他可用分支。

**切换分支：**

```
Switch to the main branch
```

```
Switch back to the feature/user-profile branch
```

---

## 查看改动情况

提交之前，通常值得先查看你实际改了什么。Git 的 `diff` 命令显示当前文件与上次提交之间的差异。

```
Show me what has changed since the last commit
```

Claude 会运行 `git diff`，然后用通俗的语言解释改动——不只是把原始 diff 呈现给你，而是真正地说明每个改动做了什么。

以下情况特别有用：
- 你工作了一段时间，想在提交前做个完整性检查
- 你面对一个很大的 diff，想要一个摘要而不是逐行阅读
- 你想确认没有混入意外的改动

---

## 创建 Pull Request

Pull Request（PR）是将你的分支改动合并到主代码库的提议方式。这是协作开发的标准工作流——你推送分支，发起 Pull Request，有人审查，然后合并。

Claude Code 可以使用 `gh` 命令行工具（GitHub 的官方 CLI）为你创建 Pull Request：

```
Create a pull request for the changes on this branch
```

Claude 会：
1. 将你的分支推送到 GitHub（如果尚未推送）
2. 运行 `gh pr create`
3. 根据你的提交和实际改动撰写 PR 标题和描述
4. 创建 PR

Claude 撰写的 PR 描述同样很详尽——它会查看代码中实际改了什么，并写出解释目的、方法，以及审查者需要注意的重要事项的描述。

你可以为 Claude 提供上下文：

```
Create a PR for this feature. Note that the main change is in the payment processing module, and reviewers should pay attention to the error handling logic.
```

**查看已有的 PR：**

```
Show me the open pull requests on this repository
```

---

## 常见场景

### 场景：开始一个新功能

```
Me: I'm going to add a search feature. Can you set up a branch for this?

Claude: I'll create a feature branch for the search functionality.

Running: git checkout -b feature/search
Switched to a new branch 'feature/search'

You're now on the feature/search branch. Any changes you make here
won't affect main until you merge. Ready to start building?
```

### 场景：结束一天的工作，保存进度

```
Me: Save everything I've done today as a commit

Claude: Let me check what has changed.

Running: git status
[output showing modified files]

I see you've modified:
- src/components/SearchBar.jsx
- src/api/search.js
- tests/search.test.js

These look like a coherent set of changes for the search feature.
Let me commit them:

Running: git add .
Running: git commit -m "feat: add basic search functionality

Adds SearchBar component and search API endpoint.
Basic text matching implemented; no pagination yet."

Committed. Your work is saved.
```

### 场景：出了问题，需要撤销

```
Me: I made a commit but the change was wrong. How do I undo it?

Claude: There are a few options depending on what you want:

1. If you want to keep the changes but remove the commit (so you can fix
   things and re-commit):
   git reset HEAD~1

2. If you want to undo the changes entirely:
   git reset --hard HEAD~1

3. If the commit has already been pushed to a remote, it's safer to
   create a new "reverting" commit:
   git revert HEAD

Which situation are you in?
```

注意 Claude 没有直接运行命令——它先提出问题，因为正确的方案取决于具体情况。这在 Git 操作中尤其重要，因为有些操作很难撤销。

### 场景：获取团队的最新改动

```
Me: Someone merged changes to main. How do I get those?

Claude: I'll update your branch with the latest changes from main.

Running: git fetch origin
Running: git merge origin/main

Updated successfully. Your branch now includes the latest changes
from main. No conflicts were found.
```

### 场景：合并冲突

当两个人在不同分支中修改了同一个文件的同一个部分，Git 无法自动合并——这称为冲突。

```
Me: I tried to merge main into my branch and got conflicts

Claude: Let me look at the conflicts.

Running: git status
[output showing conflicted files]

You have conflicts in:
- src/components/Header.jsx

Let me look at the conflict in that file...

[reads the file, which contains conflict markers <<< === >>>]

The conflict is in the navigation menu. Main branch added a "Settings"
link, and your branch changed the styling of the existing links.

Here's what I'd suggest: keep both changes — apply the style changes
from your branch to all the links including the new "Settings" link.
Want me to resolve it that way?
```

Claude 能读取冲突标记，理解双方的改动，并提出既保留两边意图的解决方案。

---

## 建立你的安全网

如果这一章你只记住一件事，请记住这个：**勤提交**。

每次你到达一个可用的状态——哪怕不够完美，哪怕只是"新增了一个空文件"——就提交。提交不需要代价。提交是你的安全网。有了频繁的提交，最坏的情况不过是损失 30 分钟的工作，而不是三个小时。

合理的节奏：
- 完成一个逻辑工作单元后提交
- 开始有风险的改动前提交
- 结束一天工作前提交
- 某个功能第一次运行成功时提交

你以后可以把提交压缩合并，但你不能在过去创建提交。

---

**下一章：** [第十一章 — 搭建一个简单网站](./11-build-website.md) — 从零开始用 Claude Code 建立一个作品集网站的实战教程。
