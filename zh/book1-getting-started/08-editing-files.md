# 第八章：编辑文件

## Claude 是外科医生，不是推土机

当 Claude Code 编辑你的文件时，它不会从头重写一切。它进行有针对性的精确改动——找到文件中需要改变的确切位置，只修改那一部分。

把它想成外科医生与拆迁队的对比。拆迁队把一切推倒然后重建。外科医生进行精确的切口，做必要的最小工作量，然后缝合回去。Claude Code 是那个外科医生。

理解编辑是如何工作的，能帮助你自信地使用这种能力，并在少数情况下有意外发生时能发现。

---

## Claude 如何编辑文件

Claude Code 使用一个像精密查找替换一样工作的编辑工具。它定位文件中的一段特定文本，删除它，然后用新文本替换它。这发生在字符级别——Claude 不是在重新生成整个文件，而是在替换一个有针对性的部分。

对于创建全新的文件，Claude 使用一个写入工具，在你指定的路径放置一个完整的新文件。

当 Claude 即将进行编辑时，你会在终端里看到类似这样的内容：

```
Editing src/utils/validation.js:

- function validateEmail(email) {
-   return email.includes('@');
- }
+ function validateEmail(email) {
+   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+   return regex.test(email);
+ }

Allow this edit? [y/n]
```

以 `-` 开头的行（通常显示为红色）正在被删除。以 `+` 开头的行（通常显示为绿色）正在被添加。改动周围的上下文也会显示出来，帮助你了解这是在文件的哪个位置发生的。

这种"diff"格式值得学会阅读。一旦你能快速扫描它，你就能在几秒而不是几分钟内审查 Claude 提议的改动。

---

## 接受之前审查改动

审查步骤是你最重要的保护。在你按 `y` 之前，问自己：

1. **这是正确的文件吗？** 检查顶部的文件路径。
2. **这是文件里正确的位置吗？** 查看改动周围的上下文行。
3. **被删除的内容是否正确？** 红色的行应该恰好是你预期要删除的。
4. **被添加的内容是否正确？** 绿色的行应该实现你要求的内容。
5. **有没有什么看起来可疑的？** 对文件无关部分的意外改动是一个警告信号。

你不需要理解每一行代码才能进行合理的审查。如果被删除的行大致是你描述的内容，被添加的行大致是你要求的内容，那通常就足够了。你总是可以之后运行代码并测试。

---

## 你的回应选项

当 Claude 展示一个提议的编辑时，你的选项不只是是或否：

**`y`（或者直接按 Enter）** — 接受改动。Claude 进行编辑并继续。

**`n`** — 拒绝改动。Claude 不会进行编辑，通常会问你想怎么做得不同。

**输入修正内容而不是直接回复** — 如果 Claude 提议的改动几乎正确但不完全对，你可以输入你实际想要的，而不是 `y` 或 `n`。例如，如果 Claude 想把一个变量命名为 `userInput`，但你想叫它 `formData`，就输入那个。Claude 调整后重新提议。

在自动接受模式下（参见第六章），这些提示不会出现——改动会立即落地。同样的审查心态仍然适用，只是形式不同：你在观察改动出现，如果看起来有什么不对可以用 `Ctrl+C` 停止 Claude。

---

## 多文件编辑

真实的功能往往需要改动多个文件。一个新的数据库字段可能需要改动数据库 schema 文件、数据访问层文件和 UI 组件——为了一个功能改动了三个文件。

Claude Code 自然地处理这种情况。当你要求一个需要多个文件的改动时，它会按顺序提议并请求每个编辑的权限。你逐个审查并批准（或拒绝）每一个。

这实际上是一个特性，而不是一个怪癖。对每个文件分别获得批准，给了你一幅改动范围的清晰图景。如果 Claude 想编辑八个文件，而你预期只有三个，那是重要的信息——它可能是正确的，也可能表明 Claude 误解了任务。

示例对话：

```
Me: Add a "nickname" field to user profiles

Claude: I'll add the nickname field. I'll need to make changes to 4 files:
1. src/models/User.js — add the field definition
2. src/api/users.js — update the API to accept/return the field
3. src/components/ProfileForm.jsx — add the input field to the form
4. src/components/ProfileView.jsx — display the nickname if present

[按顺序展示每个编辑，请求批准]
```

---

## 当编辑出错时 — 如何撤销

有时候你批准了一个编辑，然后意识到它不对。现在怎么办？

**方案一：让 Claude 撤销它**

```
That edit wasn't quite right. Can you undo the change you just made to validation.js?
```

Claude 可以读取文件的当前状态，进行一个新的编辑来恢复改动，只要你在同一个对话里足够快地发现了问题。

**方案二：使用 git**

如果你的项目使用 git（它应该用——参见第十章），这是你最可靠的安全网。每次取得有意义的进展时就提交。然后如果出了什么问题，你可以回滚：

```bash
git diff          # 查看改变了什么
git checkout .    # 丢弃所有未提交的改动
```

Claude Code 也会帮助你做这件事：

```
The last few edits made things worse. Can you help me revert to a clean state?
```

**方案三：在编辑器里撤销**

如果你在 VS Code 里工作，大多数文本编辑器支持多级撤销（Mac 上按 Cmd+Z，Windows/Linux 上按 Ctrl+Z）。如果文件是打开的，你可以用撤销 Claude 最近的改动，就像撤销你自己的输入一样。

底线：**早提交、常提交**。Git 是终极撤销按钮，而 Claude Code 与 git 配合得非常好（更多内容在第十章）。

---

## 请求编辑的最佳实践

### 具体说明你想改变什么

模糊："Fix the validation."
更好："The email validation accepts addresses like 'test@' with no domain. Fix it to require a complete domain."

你对问题的描述越具体，Claude 就能越精确地定位修复。

### 描述目标，而不是实现

你不需要知道如何修复某件事才能让 Claude 去修复它。描述你想要的最终结果是什么样的：

"我希望按钮在表单提交时被禁用，在提交完成时重新启用。"

Claude 搞定实现。你的工作是传达期望的行为。

### 一次一个逻辑改动

把所有事情打包在一起很诱人："修复验证、添加昵称字段、改变日期格式。"但同时请求多个不相关的改动，让审查每个改动更难，也让出了问题时理解哪里出了问题更难。

把不同的改动分成独立的请求。Claude 很快——分开来做不会拖慢你的速度。

### 先要计划再进行大改动

对可能涉及很多文件或复杂逻辑的改动，在任何编辑开始之前先要一个计划：

```
Before making any changes, can you tell me which files you would need to modify and what you would do to each one? I want to review the approach before we start.
```

这实际上是在要求 Claude 在拿起任何工具之前先在脑子里走一遍流程。它给了你一个在代码改变之前发现误解的机会。

### 用测试来审查

如果你的项目有自动化测试，在进行编辑后让 Claude 运行它们：

```
After making these changes, please run the tests and let me know if anything broke
```

测试是自动化的审阅者，能发现你和 Claude 在手动审查时都可能遗漏的事情。

---

## 关于文件创建的说明

创建新文件感觉上与编辑已有文件不同，但过程是一样的。Claude 会向你展示它计划创建的文件的完整内容，并在把它写入磁盘之前请求你的权限。

当 Claude 创建新文件时，要特别注意：
- 文件名和位置（在你预期的地方吗？）
- 文件是否遵循项目现有的命名约定
- 它是否正确地导入或引用了其他内容

一个项目其余部分找不到的新文件是没用的。Claude 通常把这个搞对，但值得确认一下。

---

**下一章：** [第九章 — 运行命令](./09-running-commands.md) — Claude 如何执行 shell 命令，它能用它们做什么，以及如何保持掌控。
