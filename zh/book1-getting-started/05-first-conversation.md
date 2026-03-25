# 第五章：第一次对话

## 我们来真的

这一章和前几章不同。我们不再谈论 Claude Code 了。我们要用它。

本章结束时，你将会：
- 启动一个 Claude Code 会话
- 提出你的第一个问题
- 亲眼看 Claude Code 在你的电脑上创建真实的文件
- 理解每一步发生了什么
- 学到最常见的新手错误是如何避免的

保持你的终端开着。我们开始。

---

## 第一步：选一个工作文件夹

在启动 Claude Code 之前，先导航到你想要工作的文件夹。这告诉 Claude Code 你的"项目"在哪里。它读取和创建的所有内容都相对于这个位置。

对于这个教程，让我们专门创建一个用来练习的全新文件夹：

```bash
mkdir my-first-claude-project
cd my-first-claude-project
```

第一条命令创建了一个名为 `my-first-claude-project` 的新文件夹。第二条命令把你移动到里面。你现在应该能看到提示符显示了新文件夹的名字。

**为什么这很重要？** Claude Code 把你启动它时所在的文件夹当作你的项目根目录。它会从这里读取文件、在这里创建文件，当你问"这个项目里有什么？"时它会看这里。

---

## 第二步：启动 Claude Code

现在启动 Claude Code：

```bash
claude
```

第一次运行时（你已经在安装过程中登录了），你会看到欢迎界面。它大致长这样：

```
 Claude Code  v2.x.x

 What can I help you with?

>
```

那个 `>` 是你的提示符。Claude Code 在等你输入。

如果这是你安装后第一次运行 Claude Code，它可能会打开浏览器窗口让你登录。完成登录，回到终端，你会看到同样的欢迎界面。

---

## 第三步：你的第一个提示词

我们从简单的开始。输入这个并按 Enter：

```
What files are in this directory?
```

因为我们刚刚创建了这个文件夹，它是空的。Claude Code 的回复会告诉你恰恰如此：

```
The directory is empty — no files or folders have been created yet.

Would you like me to create something, or are you planning to add files here?
```

这看起来很平凡，但注意刚刚发生了什么：Claude Code 没有猜测，没有胡编。它真的查看了你的目录并报告它发现的——什么都没有。这是 Claude Code 的 Read 工具在运作。

现在让我们给它点事情做。

---

## 第四步：让 Claude Code 创建一个文件

输入这个：

```
Create a simple HTML page that says Hello World
```

看看会发生什么。Claude Code 会思考片刻，然后展示给你看类似这样的内容：

```
I'll create a simple HTML page for you.

Creating index.html:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f4f8;
        }
        h1 {
            color: #2d3748;
            font-size: 3rem;
        }
    </style>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>

Allow this file write? [y/n]
```

Claude Code 展示了它想要创建的内容。它在写入任何东西之前请求你的权限。这是权限系统在运作——Claude Code 总会在行动前展示它计划做什么。

输入 `y` 并按 Enter。

```
Created index.html

The Hello World page is ready. You can open it in your browser by:
- Double-clicking the file in your file manager
- Or running: open index.html (on Mac)
```

文件现在存在于你的电脑上了。去打开它——你可以把它拖到浏览器窗口，或者使用 Claude Code 建议的命令。

你刚刚做出了一个网页。

---

## 第五步：理解发生了什么

让我们放慢速度，追溯 Claude Code 在你要求那个 HTML 页面时在背后做了什么：

1. **Claude 读取了你的消息**，理解了你想要的是：（a）一个文件，（b）HTML 格式，（c）"Hello World"内容。

2. **Claude 决定了文件名**（`index.html` 是主网页的惯例名称）。

3. **Claude 组织了 HTML**——不只是最简单的 `<h1>Hello World</h1>`，而是一个完整的页面结构，带有 `<!DOCTYPE>`、字符编码、标题，甚至基本的样式来让它看起来不错。

4. **Claude 展示了内容**，并用 Write 工具请求权限。

5. **当你说 yes 时**，Claude 创建了文件。

6. **Claude 告诉你如何打开它**，不用你额外问。

这个序列——理解意图、决定方法、向你展示计划、获得许可后执行、报告结果——是你会一遍又一遍看到的模式。

---

## 第六步：继续对话

Claude Code 记住你们对话的上下文。你不需要在每条消息里重新解释一切。试试这个：

```
Now add a button that changes the background color when clicked
```

注意你没有说"向我刚刚创建的 HTML 页面添加一个按钮"。Claude Code 知道你在说什么。它会读取 `index.html`，添加一个带有 JavaScript 的按钮来改变背景颜色，然后在进行编辑之前请求你的权限。

这就是为什么 Claude Code 感觉更像与合作者对话，而不是一系列独立的查询。

---

## 第七步：提问（不需要采取行动）

不是每条消息都要导致文件改变。你也可以提问：

```
Explain what the CSS in index.html does
```

Claude Code 会读取文件，然后用通俗语言解释每个 CSS 属性——`display: flex` 做什么、为什么 `justify-content: center` 能水平居中，等等。这是一种极好的学习方式。

你可以继续追问：

```
What would I change if I wanted the text to be blue instead of dark gray?
```

Claude Code 会指出具体的行，解释需要改什么。你可以让它来做这个改动，或者自己试试练练手。

---

## 审批流程：每种回应意味着什么

当 Claude Code 想要采取行动时，它会展示某些内容并等待你的回应。以下是你的选项通常是什么：

**`y` 或者直接按 Enter** — 批准这个特定操作。Claude Code 继续执行。

**`n`** — 拒绝这个特定操作。Claude Code 不会做这个改变，通常会问你想以什么不同的方式继续。

**输入修正内容** — 不只是 `y` 或 `n`，你可以输入一条修改后的指令。例如，如果 Claude Code 提议把文件命名为 `helper.js`，但你想叫它 `utils.js`，就输入那个，而不是批准。

**`a`（全部接受）** — 在这次会话的剩余时间里，不再询问就批准所有操作。在你信任 Claude Code 判断的长任务中使用这个。注意你不会看到单独的确认了。

在某些版本里，你可能会看到完整的文字选项，比如 `[Yes/No/Accept All]`，而不是单个字母——概念是一样的。

---

## 写好提示词的技巧

在观察人们使用 AI 工具多年后，以下这些模式始终能产生更好的结果：

### 具体说明你想要什么，而不只是你有什么

效果较差："Fix the bug."
效果更好："Fix the bug where clicking the button does nothing on mobile — it works on desktop."

Claude Code 需要知道*什么*是问题，以及*如何识别*正确的结果。你越具体，它需要猜测的就越少。

### 描述结果，而不是实现方式

你通常不需要知道如何做某事才能让 Claude Code 去做。描述你想要的最终结果是什么样的。

效果较差："Add a `setTimeout` with 500 milliseconds before calling `showModal()`"
效果更好："Add a small delay before the modal appears so it doesn't pop up instantly when the page loads"

Claude Code 可以自己搞定实现细节。你的工作是传达意图。

### 一次一件事（通常）

对于复杂任务，分步骤往往比一条巨大的指令效果更好。先"创建文件结构"，再"现在添加所有功能"。

例外：当步骤明显相关时，Claude Code 能很好地处理多步任务。"为 utils.js 里的每个函数写测试并运行它们"是一个完全合理的单条提示词。

### 用自然语言

你不需要像写终端命令或编程规格说明那样表达自己。像跟一个有能力的同事说话那样跟 Claude Code 说话。

可以："yo can you make the font bigger on that heading"
也可以："Please increase the font size of the h1 element"
两者都行。

---

## 新手常见错误

### 错误一：不审查 Claude Code 的提案

Claude Code 在行动之前展示它的计划。很多新用户只是不停地按 `y` 而不看。这在大多数时候没问题，但这意味着你错过了在错误发生之前发现它们的机会，也没有学到 Claude Code 正在做什么。

花点时间读一下提案的改动，特别是文件编辑。diff 格式（以 `-` 开头的行是被删除的，以 `+` 开头的行是被添加的）值得学会快速阅读。

### 错误二：只描述症状而不提供上下文

"It doesn't work" 是你能告诉 Claude Code 的最没用的话。它不知道"正常工作"是什么样子，你看到了什么错误，你试过什么，或者问题出现之前改了什么。

当有东西坏了，描述：你预期会发生什么，实际发生了什么，以及你看到的任何报错信息。

### 错误三：期待 Claude Code 知道它不可能知道的事情

Claude Code 知道你文件里有什么，以及你在对话中告诉它的内容。它不知道：
- 你的项目应该做什么（除非你告诉它或者它读到了你写的文档）
- 只存在于你脑子里的业务上下文或需求
- 之前会话里发生了什么（每次会话都从新开始，除非你继续它）

如果 Claude Code 做了看起来不对的选择，通常是因为它没有正确的上下文。告诉它更多。

### 错误四：不问后续问题

新用户的一个常见模式：Claude Code 做了某件事，不太对，用户接受了，然后试图自己修复它——挣扎了 20 分钟后放弃。

相反，直接告诉 Claude Code 哪里不对：

```
That's close, but the button should be on the right side of the page, not the left
```

或者：

```
Can you explain why you chose to structure it that way? I was expecting something different.
```

Claude Code 能优雅地处理修正意见。告诉 Claude Code 什么需要修复，几乎总是比自己修复更快。

### 错误五：忘记对话有历史记录

在一次会话里，Claude Code 记住了发生的一切。你不需要重复上下文。

但当你开始一次新会话时（或者你运行了 `/clear`），那段历史就消失了。如果你在继续之前会话的工作，简短的回顾会有帮助："我昨天在做一个待办事项应用——让我帮你了解一下进展。"

---

## 常用命令

在结束这一章之前，以下是一些会经常用到的命令：

| 你输入的内容 | 它做什么 |
|---|---|
| `/help` | 显示可用命令和快捷键 |
| `/clear` | 清除对话历史并重新开始 |
| `Ctrl+C` | 取消当前操作 |
| `exit` | 退出 Claude Code |
| `?` | 显示键盘快捷键 |
| `/resume` | 继续之前的对话 |

---

## 接下来呢？

你已经安装了 Claude Code，开始了第一次会话，创建了一个文件，并学习了核心交互模式。这不是小事——你已经使用了一个真正复杂的工具来创造出了真实的东西。

从这里开始，最好的做法就是去探索。试着让 Claude Code：
- 解释一段你从未看懂的代码
- 建立一个你一直想做的简单东西
- 用展示示例的方式帮你学习一个新的编程概念
- 修复一个一直困扰你的 bug

你进行的每一次对话都会让你更善于有效地引导 Claude Code。这个工具随着你的使用变得越来越有用——不是因为它改变了，而是因为你改变了。

---

**下一章：** [第六章 — 权限模式](./06-permission-modes.md) — 理解自动、计划和默认模式，以及什么时候该用哪个。
