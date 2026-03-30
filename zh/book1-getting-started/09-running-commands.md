# 第九章：运行命令

## 终端能做什么

如果你不太熟悉终端，这里先简单介绍一下：终端是一种通过文字来控制电脑的界面。不需要点击图标，不需要找菜单，你只需要输入命令。

开发者使用终端，是因为许多强大的工具只存在于终端——构建系统、测试运行器、包管理器、版本控制、部署工具——而且很多复杂操作用一行命令就能完成，省去了反复点菜单的麻烦。

Claude Code 可以代替你在终端运行命令。这让它从代码编辑器升级为能真正采取行动的助手：安装依赖、运行测试、启动开发服务器、查看项目状态。不只是建议——而是真正去做。

本章解释这是如何工作的、什么时候有用，以及如何保持对它的掌控。

---

## Claude 如何使用终端

当 Claude 需要运行命令时，它会使用 Bash 工具。在运行任何命令之前，它都会先告诉你它打算执行什么，并请求你的许可：

```
I need to install the date-fns library.

Running: npm install date-fns

Allow this command? [y/n]
```

你能在命令运行之前看到具体内容，没有任何意外。

在 Windows 上，Claude Code 除了 Bash 工具外还提供原生 **PowerShell 工具**（v2.1.84 起作为 opt-in 预览），无需 WSL 即可直接执行 PowerShell 命令，让 Windows 原生开发工作流获得与 Unix 系统接近的体验。

你批准后，Claude 运行命令并读取输出结果。它通过这个输出来了解发生了什么——命令是否成功、打印了什么、是否有报错——然后继续任务或告诉你结果。

这个反馈循环非常有价值。Claude 可以根据真实结果做出反应，而不是靠猜。如果命令失败，Claude 看到错误信息就能尝试不同的方案。

---

## 常见用例

### 安装包

```
Install the axios library for making HTTP requests
```

Claude 会为你的项目运行合适的安装命令（`npm install axios`、`pip install requests`、`yarn add axios` 等），并确认安装成功。

### 运行测试

```
Run the tests and tell me if any are failing
```

Claude 运行你的测试套件，读取输出，告诉你哪些测试通过了、哪些失败了。如果有测试失败，它通常能找到原因并提出修复方案。

```
Run just the tests in the auth module
```

大多数测试框架支持只运行特定文件或目录。Claude 会找出适合你项目的命令。

### 启动开发服务器

```
Start the development server so I can preview my changes
```

Claude 会运行合适的启动命令（`npm run dev`、`python manage.py runserver`、`rails server` 等）。对于开发服务器这样需要持续运行的进程，Claude 通常会启动它并告知状态，服务器在后台保持运行。

### 构建项目

```
Build the project and tell me if there are any errors
```

Claude 运行构建命令，读取输出，报告成功或失败。如果有编译错误，它会读取错误并进行修复。

### 查看项目状态

```
What is the current git status of this project?
```

```
Show me which files have been modified recently
```

Claude 可以运行信息查询命令（`git status`、`git log`、`ls -la`），收集信息后报告给你。

### 数据库操作

```
Run the database migrations
```

```
Seed the database with test data
```

对于有数据库的项目，Claude 可以运行迁移和数据填充命令，帮助你设置或更新数据库结构。

---

## 理解命令输出

Claude 运行命令时会读取输出内容——即命令打印到屏幕上的文字——并将其纳入自己的理解中。对你来说，这意味着：

**你可以让 Claude 解释输出：**

```
I ran the build and got a bunch of warnings. What do they mean?
```

**Claude 利用输出来诊断问题：**

命令失败时，Claude 看到错误信息就通常能告诉你哪里出了问题：

```
The npm install failed with an error about peer dependencies. Let me look at that...
```

**你也能看到输出：**

无论 Claude 运行什么，你都能看到真实的终端输出。你不是在一个黑盒里工作——每条命令和每个响应的完整文本都在你的终端里清晰可见。

---

## 长时间运行的命令

有些命令需要一段时间。测试可能跑 30 秒，构建可能需要几分钟，数据库数据填充可能更长。

Claude Code 会在这些命令运行时等待完成，然后再继续。等待期间，你通常可以看到实时输出流向终端。

如果你启动了一个命令后改变了主意，按 `Ctrl+C` 取消它。

对于需要持续运行的长时间进程（比如开发服务器），Claude 可以启动它们，说明它们正在后台运行，然后继续处理其他任务，同时服务器保持运行。

**后台命令：**

如果你想让 Claude 启动某个任务后不等待完成，可以明确说：

```
Start the development server in the background
```

Claude 会启动进程并将控制权交还给你，服务器在后台单独运行。在终端中也可以按 `Ctrl+B` 手动将正在运行的命令转到后台。

---

## 安全性：Claude 不会随意运行命令

Claude Code 对运行命令采取保守策略。基本原则：

- **读取命令**（如 `ls`、`cat`、`git status`）——Claude 可以较为自由地运行，因为它们不会改变任何东西
- **写入或执行命令**（如安装包、修改文件、运行脚本）——Claude 每次都会请求你的许可

此外，某些类型的命令会受到额外谨慎的对待：

**敏感操作：** 可能删除数据、暴露密钥、修改系统设置或向外部服务发起网络请求的命令，需要你明确批准。

**不可逆操作：** 任何难以撤销的操作——如删除文件或向远程服务器推送代码——都会提示你确认。

**涉及敏感文件的命令：** 没有你的明确许可，Claude 不会读取 `.env` 文件（通常包含密码和 API 密钥）的内容或将其传递给命令。

你可以使用第六章描述的权限系统自定义哪些命令始终允许或始终拒绝。例如，你可以始终允许 `npm run test`，这样就不需要每次都确认测试运行了。

---

## 用 `!` 自己运行命令

有时你想自己运行命令，不需要让 Claude 来做决定。你可以在 Claude Code 提示符里以 `!` 开头直接输入：

```
! git status
! ls -la
! npm run build
```

`!` 前缀告诉 Claude Code 直接运行这个命令，并将输出添加到对话上下文中。这意味着 Claude 能看到发生了什么，你也可以就此提问：

```
! npm run build
[build output appears]
There were 3 TypeScript errors in the output. Can you help me fix them?
```

当你知道自己想运行什么命令，但又想让 Claude 帮你理解或处理结果时，这个功能非常有用。

---

## 实际示例：新建项目的完整流程

下面是命令执行在真实场景中的流程。假设你刚开始一个新的 web 项目，想让 Claude 帮你搭建：

```
Me: Create a new React app called my-portfolio and set it up for development

Claude: I'll set up a React app for you. Let me run a few commands:

Running: npx create-react-app my-portfolio
[npm install output... completes]

Running: cd my-portfolio && npm install --save-dev prettier eslint
[install output... completes]

I've created the React app and added Prettier and ESLint for code formatting.
The project is ready in the my-portfolio directory.

To start the development server:
npm start

Shall I start the development server now?

Me: Yes, start it up

Running: npm start
[server starting output...]

The development server is running at http://localhost:3000.
Open that URL in your browser to see your app.
```

注意 Claude 是怎样依次执行多个命令、报告每个命令的结果、在继续前与你确认的。整个搭建过程只需要你发一条消息，Claude 几秒钟就完成了。

---

## 命令出错时怎么办

命令会失败，这很正常。依赖可能不可用，端口可能已被占用，配置文件可能缺失。

命令失败时，Claude 读取错误输出，通常知道该怎么做：

```
The npm install failed:
> npm ERR! peer dep missing: react@>=16.8.0

This means the package requires a newer version of React than you have installed.
I can update React first. Would you like me to do that?
```

如果 Claude 建议的修复方案没有效果，告诉它发生了什么：

```
That didn't work — I got the same error. Here is the new output: [paste output]
```

Claude 会尝试不同的方案。调试命令失败是一个来回交流的过程，Claude 在尝试多种策略时很有耐心。

---

**下一章：** [第十章 — Git 工作流](./10-git-workflows.md) — 使用 Claude 提交更改、管理分支和创建 Pull Request。
