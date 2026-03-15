# 第十二章：Debug 技巧

## 每个程序员都会遇到 Bug

程序出错是正常的。专业开发者每天都在和 bug 打交道。不同之处在于：他们有一套有效的调试方法。

Claude Code 可以成为你最好的调试伙伴。本章教你如何高效使用 Claude Code 来找出并修复问题。

---

## 最直接的方式：把报错贴给 Claude

遇到报错，最简单的第一步就是把错误信息完整地粘贴给 Claude：

```
我运行 npm start 后出现了这个错误，帮我修复：

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'
imported from /Users/xiaoming/my-project/src/app.js
Did you mean to import express-session?
    at new NodeError (node:internal/errors:405:5)
    at packageResolve (node:internal/modules/esm/resolve:782:9)
    ...
```

**Claude 会做什么：**
1. 解释这个错误是什么意思（找不到 express 包）
2. 分析为什么会出现（没有安装，或者安装到了错误路径）
3. 给出修复步骤（`npm install express`）

**技巧：复制完整报错，不要截断。** 最后几行通常是最重要的，显示错误发生的具体位置。

---

## "为什么这个不工作？"

有时候代码没有报错，但结果不对。这种情况下，描述你期望的行为和实际的行为：

```
这个函数本来应该过滤掉价格低于 100 的商品，
但运行后所有商品都被过滤掉了，不知道哪里出了问题：

const filterProducts = (products, minPrice) => {
    return products.filter(product => product.price < minPrice);
};
```

Claude 会发现：比较运算符用反了，`<` 应该改为 `>`。

**描述 bug 的好格式：**

```
【期望行为】
输入 [100, 50, 200, 30]，应该过滤后得到 [100, 200]

【实际行为】
运行后得到空数组 []

【代码】
[粘贴相关代码]
```

---

## 用 Claude 读 Stack Trace

Stack trace 是程序崩溃时显示的调用链——它告诉你错误发生在哪里、经历了哪些函数调用。

```
帮我解释这个 stack trace，从最重要的信息开始说起：

TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (src/components/ProductList.jsx:15:20)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/...)
    ...（更多行）
```

Claude 会指出：

```
关键信息：
位置：ProductList.jsx 第 15 行
错误：你在一个 undefined（未定义）的值上调用了 .map() 方法

这通常意味着：你传入的 products 属性可能是 undefined
而不是一个数组。

建议：检查第 15 行的 products.map() 调用，确保 products
在使用前已经有值，或者添加一个默认值：

const ProductList = ({ products = [] }) => {
    ...
}
```

---

## 常见调试策略

### 策略一：隔离问题

不要试图一次性找出复杂系统里的 bug。先告诉 Claude：

```
这个功能涉及 3 个文件，但我想先缩小范围——
帮我判断一下，问题更可能出在哪个环节？

1. 数据获取（fetchUser 函数）
2. 数据处理（transformUserData 函数）
3. 页面渲染（UserProfile 组件）
```

### 策略二：加日志排查

```
帮我在这个函数里加几个 console.log，
打印出关键变量的值，帮我追踪数据流向：

function processOrder(order) {
    const items = order.items.filter(item => item.inStock);
    const total = items.reduce((sum, item) => sum + item.price, 0);
    return { items, total };
}
```

Claude 会建议在合适的位置添加日志，你运行后把输出粘贴回来，再进一步分析。

### 策略三：逐步缩小范围

```
我在注释掉部分代码后，发现只有当这段代码运行时才出错：

[粘贴可疑代码片段]

这段代码有什么问题？
```

### 策略四：对比"能用的"和"不能用的"

```
同样的逻辑，这段代码可以正常工作：
[粘贴正常代码]

但这段代码会出错：
[粘贴有问题的代码]

帮我找出两者之间的关键区别。
```

### 策略五：让 Claude 检查常见错误

```
帮我检查这段代码，看有没有常见的 bug 类型：
- 变量未定义或拼写错误
- 异步操作没有正确等待
- 边界情况没有处理（空数组、null 值等）
- 类型错误（数字当字符串用等）

[粘贴代码]
```

---

## Claude 卡住时怎么办

有时候 Claude 给出的解决方案不管用，或者问题太复杂让 Claude 也不确定。这时候怎么办？

### 方法一：提供更多上下文

```
上次你建议的方法没有解决问题，报错还是存在。
让我给你更多信息：

- 这个项目用的 Node.js 版本是 16.14
- 这个错误只在 Windows 上出现，Mac 上没问题
- 相关的依赖版本：express 4.18.2, mongoose 6.8.3

[重新描述问题]
```

### 方法二：要求换一种思路

```
你上一个方案（修改 app.js 第 45 行）没有效果，
能换一个完全不同的角度来分析这个问题吗？
```

### 方法三：把问题拆小

如果大问题解决不了，把它拆成更小的部分：

```
我暂时放弃解决整个功能的问题。
先帮我回答一个更小的问题：
这个函数为什么会返回 undefined 而不是一个对象？

function getUser(id) {
    const users = loadUsers();
    users.find(u => u.id === id);
}
```

（答案：忘了加 `return`！）

### 方法四：让 Claude 解释它的思路

```
你建议的解决方案我看不懂，能解释一下你是怎么想的吗？
为什么这个修改会解决问题？
```

理解了原理，你才能判断这个方案是否正确，也能发现 Claude 可能的误解。

### 方法五：重新开始描述

有时候你的描述本身让 Claude 走了弯路，可以清空上下文重新说：

```
我重新描述一下这个问题：

【环境】Node.js 18，Express 4.18
【触发条件】用户提交登录表单时
【症状】服务器返回 500 错误
【我已经尝试过的】检查了密码哈希逻辑，没问题
【相关代码】[粘贴代码]
```

---

## 一个真实的调试流程

**场景：** 一个网站上的"添加购物车"按钮点击后没有反应。

```
步骤一：描述症状
你：点击"添加购物车"按钮没有任何反应，
    既不添加商品，也不报错，浏览器控制台也没输出。

Claude：这种"静默失败"通常是事件监听器没有正确绑定，
        或者函数被调用了但在某个地方默默失败了。
        我来检查一下相关代码。

步骤二：Claude 看代码
（Claude 读取相关文件）

Claude：我找到问题了。在 cart.js 第 23 行：
        button.addEventlistener('click', addToCart);

        注意：addEventListener 里的 'L' 是小写，
        应该是 addEventListener（驼峰命名）。
        JavaScript 的方法名是大小写敏感的。

步骤三：确认修复
你：天呐，就是这个！帮我改正它，然后检查
    整个文件有没有类似的拼写错误。

Claude：已修复，另外在第 45 行还有一个类似问题：
        element.removeEventlistener → removeEventListener
        两处都已修正。
```

---

## 调试时的好习惯

**在提问前先做：**
- 复制完整的错误信息，不要截断
- 记录触发 bug 的具体步骤
- 排查一下是什么时候开始出现的（最近修改了什么？）

**在提问时：**
- 说清楚期望行为和实际行为的差距
- 提供相关代码，而不是整个项目
- 说明你已经尝试过什么、结果如何

**修复后：**
- 让 Claude 解释修复的原因，而不只是接受它
- 想一想同类问题在其他地方是否存在
- 如果条件允许，写一个测试来防止它再次出现

---

## 小结

- **报错信息直接贴给 Claude**，它会解释原因和修复方法
- **描述期望 vs 实际行为**，帮 Claude 理解问题所在
- **Stack trace 不用自己看懂**，Claude 帮你解析关键信息
- **调试是迭代过程**：隔离 → 分析 → 修复 → 验证
- **Claude 卡住时**：提供更多上下文，换角度，或者把问题拆小

调试能力是区分初级开发者和高级开发者的重要标志。有了 Claude Code，你可以大大提升排查问题的速度——关键是要学会描述问题，而不只是把代码扔给它。

---

**下一章：** [对接 API](./13-working-with-apis.md)
