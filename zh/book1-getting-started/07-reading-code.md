# 第七章：读懂和理解代码

## 接手代码的困境

想象这个场景：你的同事把一个他们已经做了两年的项目交给你。文件夹里有几百个文件。几乎没有文档。你的同事现在联系不上了。你的经理要求你在本周末之前添加一个"简单"的功能。

这种情况在软件开发中一再上演。就算是你自己写的代码，六个月后回来看也可能感觉像是在读别人的工作。

Claude Code 读取和解释代码的能力，对很多用户来说是它立竿见影最有用的功能。不是写新代码，不是运行命令，就是这一件事：*告诉我这里到底是怎么回事。*

本章向你展示如何把这种能力发挥到极致。

---

## 最佳开场白：给我一个概览

当你第一次把 Claude Code 投入一个陌生的项目时，最好的起手式是一个宽泛的问题：

```
Give me an overview of this codebase
```

你得到的回答不只是一份文件列表。Claude 会浏览整个项目结构——查看文件名、文件夹组织、配置文件、依赖列表、入口点和关键源文件——并综合出一份摘要，涵盖：

- 这个项目做什么
- 它是如何组织的
- 它使用什么技术
- 主要组件是什么以及它们如何关联

单单这一个问题，在一个空白会话里对着一个大型代码库问，就能给你比自己摸索一个小时更多的情境意识。

从那里开始，你可以缩小范围：

```
Explain the main architecture patterns used here
```

```
What are the key data models in this project?
```

```
How does the authentication system work?
```

每个后续问题都建立在前一个的基础上。你在进行一场有引导的代码库之旅，而 Claude 是你的向导。

---

## 询问特定文件

有时候你知道你关心哪个文件。你可以直接说：

```
Explain what src/api/handlers.js does
```

或者使用 `@` 引用语法直接把文件拉入对话：

```
Walk me through the logic in @src/utils/validation.js
```

`@` 前缀告诉 Claude 读取那个特定的文件并把对话集中在它上面。你可以一次提到多个文件：

```
How do @src/auth/login.js and @src/auth/session.js work together?
```

这在你知道一个 bug 或功能涉及多个文件，并且想在改动任何东西之前理解它们的关系时很有用。

---

## 询问特定函数

大文件可能让人不知所措。如果你想深入到特定的一段逻辑：

```
Explain what the processPayment function does, step by step
```

```
What does the useFormValidation hook return, and when should I use it?
```

```
Walk me through what happens when the exportToPDF function is called
```

Claude 会读取这个函数，追踪它的输入和输出，解释任何副作用，并告诉你它处理（或未处理）了哪些边界情况。如果你不熟悉这门语言或正在使用的模式，这比自己读代码要快得多。

---

## "这个报错是什么意思？"

这是人们转向 Claude Code 的最常见原因之一。你运行了某个东西，得到了一墙红字，完全不知道从哪里开始。

最简单的方式：

```
I got this error when I ran npm test:

TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/src/components/ProductList.jsx:23:15)
    at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:16141:18)
    ...
```

Claude 会：
1. 识别根本原因（某个东西是 `undefined`，而代码预期是一个数组）
2. 把你指向确切的文件和行号（`ProductList.jsx` 第 23 行）
3. 解释为什么可能会发生这种情况
4. 建议修复方案

你也可以粘贴错误并让 Claude 查看相关文件：

```
I'm getting this error: [error text]. Can you look at @src/components/ProductList.jsx and tell me what's wrong?
```

当 Claude 能同时看到报错和代码时，它的诊断比只看其中一个要准确得多。

---

## 理解不熟悉的语言

Claude Code 一个被低估的超能力：它读取任何编程语言的代码，并且会用普通语言解释那段代码，不管你懂什么语言。

如果你是 Python 开发者，正在看一个 JavaScript 项目：

```
I'm primarily a Python developer. Can you explain this JavaScript code in terms I would understand, drawing comparisons to Python where helpful?
```

如果你完全是编程新手，正在看任何代码：

```
I'm not a programmer. Can you explain what this code does in plain language, as if explaining it to someone who has never coded before?
```

Claude 会把解释调整到你所说的水平。不要因为要求更简单的解释而觉得不好意思——总是比假装看懂了好。

---

## 探索大型代码库

有些项目有几千个文件。你无法读完所有东西。Claude Code 给了你一种更聪明的导航方式。

**找到某样东西在哪里：**

```
Where in this codebase is the email notification logic handled?
```

```
Which files would I need to modify to change how user profiles are displayed?
```

**追踪某个功能的流程：**

```
Trace what happens from when a user clicks "Submit Order" all the way to when the order is stored in the database
```

这种流程追踪——从用户操作通过代码到最终结果——能揭示很多关于系统如何工作、存在哪些依赖关系、以及 bug 可能藏在哪里的信息。

**理解命名约定和模式：**

```
What naming conventions does this project follow?
```

```
What design patterns are used in this codebase? Are there any inconsistencies?
```

理解一个项目的模式能帮助你写出融入其中的代码，而不是格格不入的代码。

---

## 更好代码阅读会话的技巧

### 先宽后窄

抵制直接跳到"我如何修复 X？"的冲动。从"这个系统做什么？"开始。理解上下文会让具体问题更容易正确回答。

### 问"为什么"而不只是"是什么"

```
Why is the data being stored in localStorage instead of a database here?
```

```
Why does this function make three API calls instead of one?
```

"为什么"的问题往往能揭示架构决策、历史背景或技术限制——这些是单纯读代码无法告诉你的。

### 问什么是缺失的

```
What functionality would you expect to see in a module like this that seems to be missing?
```

```
Are there any obvious error cases that this code doesn't handle?
```

Claude 能识别代码中的空缺——那些事情可能出错但没有处理的地方——就像它解释已有的内容一样容易。

### 告诉 Claude 你的目标

上下文帮助 Claude 给出更好的答案：

```
I need to add a bulk upload feature. Before I start, can you help me understand how the existing single-file upload works so I can build on it?
```

知道你的目标能帮助 Claude 把解释集中在对你特定任务重要的内容上，而不是把所有东西都解释得一样详细。

### 随时提出后续问题

你不必在第一遍就理解一切。如果 Claude 的解释里包含了你不认识的术语，就问：

```
You mentioned "middleware" — can you explain what that means in this context?
```

```
I didn't understand the part about race conditions. Can you explain that more simply?
```

Claude 记住你们对话的上下文。你随时可以请求澄清而不会失去你的位置。

---

## 当 Claude 出错时

Claude Code 在读取你的代码并进行推断。有时候它会出错——特别是当代码不寻常、使用了出人意料的模式，或者依赖于文件中不可见的上下文时。

如果 Claude 的解释和你实际运行代码时观察到的不符，相信你观察到的。告诉 Claude 有什么不同：

```
You said this function always returns an array, but when I call it, I sometimes get null. Can you look again?
```

Claude 会重新检查它的推理，通常能自我纠正。把它当作一场对话——你可以反驳——比不加批判地接受每一个解释要产生好得多的结果。

---

## 读代码教给你什么

有经验的开发者知道一个秘密：学习一门编程语言或框架的最好方式是大量阅读用它写的代码。传统上，这既慢又令人沮丧，因为你必须自己解析一切。

有了 Claude Code，你可以读代码快得多。你看到一个模式，问它是什么意思，在三十秒内理解它，然后继续。随着时间推移，这些模式积累起来。你自己对代码如何工作的心智模型快速成长。

用 Claude Code 来理解代码不是作弊，这是加速学习。

---

**下一章：** [第八章 — 编辑文件](./08-editing-files.md) — Claude Code 如何修改你的代码，以及如何审查和控制这些改动。
