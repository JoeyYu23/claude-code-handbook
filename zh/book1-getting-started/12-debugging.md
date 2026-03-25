# 第十二章：像专家一样调试

## 关于 Bug，没有人告诉你的事

这里有一个每个有经验的开发者都知道的真相：遇到 Bug 不是你做错了什么的信号。Bug 是软件开发中正常的、不可避免的一部分。每个开发者，无论水平高低，无论新手还是专家，都会把相当一部分时间用在调试上。

沮丧的初学者和自信的开发者的区别，不在于开发者遇到的 Bug 更少。而在于开发者有一套发现和修复 Bug 的策略。

Claude Code 从根本上改变了"拥有策略"的含义。你不再需要花几个小时阅读文档、搜索 Stack Overflow、盯着同一行代码发呆。你可以描述问题、粘贴错误信息，然后与 Claude 一起作为搭档解决它。

本章为你提供这套方法。

---

## 最重要的第一步：粘贴真实的错误信息

当出现问题时，你能做的最有效的事就是把准确的错误信息粘贴给 Claude。

不是："我的代码不工作了。"
不是："我遇到了一个错误。"

是真实的错误信息，直接从你的终端或浏览器控制台复制过来。

错误信息看起来很可怕，但实际上信息量非常大。它们准确告诉你哪里出了问题、在哪个文件、哪一行。Claude 能读取它们并立即定位问题。

以下是一个真实的例子：

```
Me: I ran my Node.js server and got this error:

TypeError: Cannot read properties of null (reading 'email')
    at getUserEmail (/app/src/users.js:47:18)
    at router.get (/app/src/routes/auth.js:23:24)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)

Claude: This error means the code tried to read the `email` property
from something that is `null` — that is, it expected a user object
but got nothing.

Looking at your files, line 47 of users.js is:
  return user.email;

The function `getUserEmail` is being called with a user ID, but when
it looks up the user in the database, no user with that ID exists —
so `user` comes back as `null`, and trying to read `.email` from null
crashes.

The fix is to add a null check before accessing the property. I'll
add one now:
```

这只用了大约五秒钟。没有 Claude，这可能需要 20 分钟。

---

## 借助 Claude 读懂 Stack Trace

错误信息后面那长串文件路径和行号叫做"Stack Trace（堆栈跟踪）"。它记录了崩溃发生时所有正在执行的函数调用。

Stack Trace 对于定位 Bug 位置至关重要，但如果你以前没有读过，会觉得非常吓人。Claude 可以把它们翻译成通俗语言：

```
Can you walk me through this stack trace and explain what was happening step by step?
```

Claude 会逐帧（Stack Trace 的每一行）解释：

"在最底部，`express/lib/router/layer.js` 是 Express 框架在路由一个 web 请求。那调用了你的 `auth.js` 路由处理函数。那又调用了 `users.js` 里的 `getUserEmail` 函数。崩溃发生在 `users.js` 的第 47 行。"

一旦你知道 Stack Trace 在说什么，就能更容易理解应该把注意力集中在哪里。

---

## "为什么这个不工作？"

有时候没有错误信息。代码运行没有崩溃，但结果不对。这往往比崩溃更难调试，因为崩溃至少告诉你发生在哪里。

对于这类情况，精确描述你预期的结果和实际发生的情况：

```
Me: I have a function that's supposed to sort a list of names
alphabetically, but the output is wrong.

Input: ["Charlie", "Alice", "Bob"]
Expected output: ["Alice", "Bob", "Charlie"]
Actual output: ["Bob", "Alice", "Charlie"]

Here's the function:
[paste the code]

Claude: I see the issue. Your sort function is comparing the names
case-insensitively, which is good, but it's also using the locale
`"en-US"` setting which changes the ordering in subtle ways for
names with similar starting letters.

Actually, looking more carefully, the issue is simpler: you're
calling sort() on the array but not returning the sorted result —
you're returning the original array. Array.sort() sorts in place but
your code has a mistake in how it returns.

Let me show you:
```

注意 Claude 找到的问题和它最初怀疑的不一样。调试中这很正常——你通常会发现真正的问题不是你最初以为的那个。

---

## 常用调试策略

### 策略一：精确描述症状

你能越精确地描述问题，效果越好。对比：

模糊："登录不工作了。"
精确："当我输入有效的邮箱和密码并点击登录时，什么都没发生——没有错误提示，没有跳转，按钮就停在那里。"

精确："登录对我的测试账号有效，但对昨天数据库迁移后创建的新账号失败。"

你添加的每一处精确信息都能帮助 Claude 缩小排查范围。

### 策略二：告诉 Claude 你已经尝试过什么

```
I've already tried:
- Checking that the email and password are correct (they are)
- Looking at the network tab in Chrome DevTools — the request is being sent and returns a 200 response
- Checking the console — no errors

But the redirect still doesn't happen after successful login.
```

这能防止 Claude 建议你已经排除的方案，帮助它跳到不那么显而易见的解释。

### 策略三：让 Claude 添加调试输出

当 Bug 难以捉摸时，添加临时的日志语句能揭示正在发生什么：

```
Can you add some console.log statements to the login function so I
can see what values are flowing through it? I want to see what
the API response contains and what the code does with it.
```

Claude 会添加策略性的日志，你运行代码，读取输出，然后粘贴回来：

```
Here's what the logs showed:
[paste log output]
```

现在 Claude 有了真实的运行时值可以分析，这往往能立刻揭示问题所在。

### 策略四：升级版"小黄鸭"法

有一个古老的程序员技巧叫做"小黄鸭调试法"：大声向一只橡皮鸭解释你的代码，通常在解释的过程中就会发现问题。Claude Code 是一只会说话的小黄鸭。

```
I'm going to explain this bug to you, and I want you to ask
clarifying questions if anything I say doesn't make sense.

I have an e-commerce checkout flow. When a user clicks "Confirm Order",
it should save the order to the database, charge their card, and send
a confirmation email. The database save and charge work fine, but the
confirmation email sometimes doesn't get sent...
```

在 Claude 提问的过程中梳理问题，往往能揭示你之前不知道自己在做的假设。

---

## 当 Claude 在调试上卡住时

Claude 并非无懈可击。有时它建议的修复方案不起作用。有时它会误读复杂代码。有时 Bug 足够深，需要多次尝试。

遇到这种情况：

**告诉 Claude 它建议的结果：**
```
I tried your fix but it didn't work. Now I'm getting a different error:
[new error]
```

**让 Claude 重新审视其假设：**
```
Let's take a step back. You've suggested 3 things and none have worked.
What else could be causing this? What are we assuming that might be wrong?
```

**给 Claude 更多上下文：**
```
I should mention — this code worked fine until yesterday when I
added the new database caching layer. Could that be related?
```

**让 Claude 更仔细地阅读相关文件：**
```
Can you read through the entire auth.js file and tell me if
you notice anything suspicious? The bug might not be in the
specific function we've been looking at.
```

**换个新视角：**
如果你们来回了很久却没有进展，有时从头描述问题会有帮助："Forget everything we've discussed. Let me describe the problem fresh..."

---

## 借助 Claude 使用浏览器开发者工具

如果你在开发 web 应用，浏览器的开发者工具（通常用 F12 打开）对调试至关重要。如果你不熟悉它们，Claude 可以引导你：

```
I'm debugging a web page and I'm not sure how to use DevTools.
Can you walk me through how to find error messages in the Console tab?
```

Claude 会给你针对你的浏览器的分步指导。你也可以直接向 Claude Code 粘贴截图——粘贴一张开发者工具输出的图片，让 Claude 解释它显示的内容。

---

## 调试的思维方式

调试本质上是侦探工作。你有一个意外的结果（Bug），你要找出原因。过程是：

1. 精确观察症状
2. 形成关于原因的假设
3. 测试假设
4. 根据发现更新假设
5. 重复直到解决

Claude Code 大幅加速了第 2 和第 3 步——它能根据相同的信息形成比大多数人更好的假设，并且能快速实施测试。但整体结构是一样的。

有一件重要的事：不要靠随机改动来猜测修复方案。"也许把这个数字从 10 改成 20 就能修好……"不是调试，是随机突变。偶尔可能成功，但什么都学不到，还可能引入新的 Bug。

相反，始终要有做出改动的理由。Claude 在这方面很有帮助：它的建议总是附带解释，说明为什么它认为这个修复有效。如果你不理解解释，就问。理解修复几乎和实施修复一样重要。

---

**下一章：** [第十三章 — 使用 API](./13-working-with-apis.md) — 什么是 API，如何连接它们，以及如何用一个 API 构建出东西。
