# 第七章：读代码

## "帮我看懂这个项目" — 最被低估的用法

大多数人把 Claude Code 当成"写代码的工具"。但有一个用法同样强大，却常常被忽视：**让 Claude 帮你读懂别人的代码。**

想象这几个场景：

- 你接手了一个前同事留下的老项目，没有文档，代码密密麻麻
- 你在 GitHub 上找到一个有用的开源库，不知道从哪里入手
- 你遇到一段报错，完全不知道 stack trace 在说什么
- 你要学习一门新语言，看到别人的代码一头雾水

Claude Code 可以成为你随时可以请教的"技术顾问"——它耐心、全面，而且不会因为你问了"傻问题"而皱眉头。

---

## 快速了解一个陌生项目

当你第一次进入一个陌生的代码库，可以用这些 prompt 快速建立认知：

### 问整体结构

```
帮我看一下这个项目的目录结构，告诉我每个文件夹大概是做什么的。
```

Claude 会扫描目录，给出类似这样的解释：

```
这个项目是一个 Node.js Web 应用，目录结构如下：

src/           — 主要源码
  routes/      — 路由定义，处理 HTTP 请求
  models/      — 数据模型，对应数据库表结构
  middleware/  — 中间件（认证、日志等）
  utils/       — 工具函数

public/        — 前端静态文件（HTML、CSS、图片）
tests/         — 测试文件
config/        — 配置文件（数据库连接、环境变量）
package.json   — 项目依赖和脚本定义
```

### 问项目的核心功能

```
这个项目是做什么的？它的核心业务逻辑在哪些文件里？
```

### 问如何运行

```
这个项目怎么在本地运行？有哪些命令需要先执行？
```

Claude 会找到 `package.json`、`README` 或 `Makefile`，帮你整理出启动步骤。

---

## 理解特定文件

找到感兴趣的文件后，可以深入问：

### 读懂一个文件的整体逻辑

```
帮我解释一下 src/auth/login.js 这个文件是怎么工作的。
```

### 理解某个函数

```
getUserPermissions 这个函数是干什么的？它的参数是什么，返回什么？
```

### 追踪一个功能的执行路径

```
当用户点击"登录"按钮，代码会从哪里开始执行，经过哪些步骤，最终完成什么操作？
```

这类"追踪流程"的问题非常有用——它帮你理解数据和控制流是怎么在代码里流动的，而不仅仅是看单个文件。

---

## "这个报错是什么意思？"

遇到报错时，最直接的做法就是把报错信息粘贴给 Claude：

```
运行 npm start 后出现了这个报错，是什么意思？怎么修？

Error: Cannot find module './config/database'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
    at Function.Module._load (node:internal/modules/cjs/loader:885:27)
    at Module.require (node:internal/modules/cjs/loader:1105:19)
    at require (node:internal/modules/cjs/helpers:103:18)
    at Object.<anonymous> (/Users/xiaoming/my-project/src/app.js:3:21)
```

Claude 会解释：

```
这个报错的意思是：代码在 src/app.js 的第 3 行
尝试导入 ./config/database 这个文件，但这个文件不存在。

可能的原因：
1. config/database.js 文件还没有创建
2. 文件路径写错了（比如大小写不对）
3. 文件被删除或移动了

建议检查 src/app.js 第 3 行，看导入路径是否正确。
同时确认 config/ 目录下是否存在 database.js 文件。
```

### Stack Trace 解读

Stack trace（调用栈跟踪）是 Node.js、Python、Java 等语言报错时显示的一串信息，对新手来说往往看不懂。你可以直接问 Claude：

```
帮我解释一下这个 stack trace，从上往下每一行是什么意思？

Traceback (most recent call last):
  File "app.py", line 47, in process_order
    result = calculate_price(items)
  File "utils/pricing.py", line 23, in calculate_price
    return sum(item.price for item in items)
  File "utils/pricing.py", line 23, in <genexpr>
    return sum(item.price for item in items)
AttributeError: 'NoneType' object has no attribute 'price'
```

Claude 不仅会解释每行的含义，还会告诉你**错误根本原因**：某个 `item` 变量的值是 `None`（空），而不是一个有 `price` 属性的对象。

---

## 理解不熟悉的语言

这是 Claude Code 特别厉害的地方：**你不需要懂那门语言，也能理解代码在做什么。**

### 场景一：你主要写 Python，但需要读一段 Go 代码

```
我主要写 Python，帮我用 Python 的方式解释这段 Go 代码是在做什么：

func processUser(db *sql.DB, userID int) (User, error) {
    var user User
    err := db.QueryRow(
        "SELECT id, name, email FROM users WHERE id = ?", userID,
    ).Scan(&user.ID, &user.Name, &user.Email)
    if err != nil {
        return User{}, fmt.Errorf("user not found: %w", err)
    }
    return user, nil
}
```

Claude 会用你熟悉的方式解释：

```
用 Python 类比，这段代码等于：

def process_user(db_connection, user_id):
    cursor = db_connection.cursor()
    cursor.execute(
        "SELECT id, name, email FROM users WHERE id = %s", (user_id,)
    )
    row = cursor.fetchone()
    if row is None:
        raise ValueError(f"user not found")
    return {"id": row[0], "name": row[1], "email": row[2]}

主要功能：根据 user_id 从数据库查询用户信息并返回。
```

### 场景二：完全陌生的代码片段

```
这段代码我完全看不懂，用通俗语言告诉我它在做什么，
不用解释语法，只要说清楚逻辑：

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};
```

---

## 探索大型代码库的技巧

面对一个有几百个文件的大项目，如何高效使用 Claude Code？

### 技巧一：从入口文件开始

每个项目都有入口文件——Node.js 项目通常是 `app.js` 或 `index.js`，Python 项目通常是 `main.py`，网页项目是 `index.html`。

```
帮我从 app.js 这个入口文件开始，解释程序启动时都做了哪些初始化工作。
```

### 技巧二：用问题引导探索

不要问"把这个项目都解释给我听"——这太泛了，Claude 的回答也会很泛。

更好的方式是带着具体问题：

```
我想给这个项目添加一个"用户注销"功能，
现有的代码里哪里处理了用户认证相关的逻辑？
```

```
这个项目是怎么连接数据库的？数据库配置在哪里？
```

### 技巧三：逐步深入

先问宏观，再问微观：

```
第一步：帮我了解这个项目的架构是什么模式（MVC？分层架构？微服务？）

（得到回答后）

第二步：好的，你说它用了 MVC 模式，帮我找一下 Controller 层
       的代码在哪里，并解释其中一个 Controller 是怎么写的。
```

### 技巧四：让 Claude 画出关系图（用文字）

```
用文字示意图的方式，画出这个项目里各个模块之间的依赖关系。
```

Claude 可能会给你类似这样的结构：

```
app.js
  └── routes/
        ├── userRoutes.js → controllers/UserController.js
        │                      └── models/User.js → database/db.js
        └── orderRoutes.js → controllers/OrderController.js
                               └── models/Order.js → database/db.js
```

### 技巧五：用 `@` 引用文件

在 VS Code 的 Claude Code 插件里，你可以用 `@文件名` 来引用特定文件：

```
@src/auth/middleware.js 这个中间件的作用是什么？
它和 @src/routes/protected.js 是怎么配合工作的？
```

---

## 提问的好习惯

读代码时，这几个问题模板特别有用：

| 目标 | 问法 |
|------|------|
| 了解文件用途 | "这个文件是干什么的？" |
| 理解函数逻辑 | "XX 函数是怎么工作的？参数和返回值是什么？" |
| 追踪数据流 | "变量 XX 是从哪里来的，最终用在哪里？" |
| 理解依赖关系 | "这个模块依赖哪些其他模块？" |
| 看懂报错 | "这个错误是什么意思，可能的原因有哪些？" |
| 跨语言理解 | "用 [你熟悉的语言] 的方式解释这段 [陌生语言] 代码" |

---

## 小结

读代码是学习编程最重要的能力之一，而 Claude Code 让这件事变得容易得多：

- **新项目**：快速了解结构和功能，不用在代码里迷路
- **报错调试**：贴上 stack trace，立刻得到人话解释
- **陌生语言**：用你懂的语言来理解你不懂的代码
- **大代码库**：带着具体问题探索，逐步深入

下一章，我们来看如何让 Claude 帮你**修改**代码。

---

**下一章：** [改文件](./08-editing-files.md)
