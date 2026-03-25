# 第十三章：使用 API

## 什么是 API？

"API"是 Application Programming Interface（应用程序编程接口）的缩写。这听起来很技术性，但一旦你有了正确的类比，概念就很直接了。

想想餐厅是怎么运作的。你坐在桌边，看菜单，告诉服务员你要什么，食物就端上来了。你从不进厨房，也不需要看厨师怎么准备食物。你只是使用菜单作为你和厨房之间的既定接口。

API 的工作方式完全一样。当你的应用需要来自另一个服务的数据或功能——天气信息、支付处理、用户认证、位置数据——它就使用那个服务的 API。API 是你可以请求的"菜单"。你不需要知道另一个服务内部是怎么工作的，只需要知道如何提出请求。

你每天间接使用的几个 API 示例：
- 天气应用从天气 API 获取数据
- "用 Google 登录"按钮使用 Google 的认证 API
- 应用中的地图使用 Google Maps 或 Apple Maps API
- 支付表单使用 Stripe 或 PayPal API

---

## API 在实践中如何工作

当你的代码调用 API 时，它发送一个 HTTP 请求——和你的浏览器访问网站时发送的请求是同一种类型。请求包含：

1. **URL** — 你想访问的特定 API 端点的地址（想象成：菜单上的哪道菜）
2. **方法** — 通常是 GET（我想读取一些东西）或 POST（我想发送一些东西）
3. **Headers** — 包含认证信息的元数据
4. **Body** — 你发送的数据（用于 POST 请求）

API 以数据响应，通常是 JSON 格式——一种人类和计算机都能读懂的结构化文本格式。

天气数据的典型 API 响应可能是这样的：

```json
{
  "city": "Austin",
  "temperature": 78,
  "condition": "Partly Cloudy",
  "humidity": 65,
  "forecast": [
    {"day": "Monday", "high": 82, "low": 68},
    {"day": "Tuesday", "high": 79, "low": 65}
  ]
}
```

你的代码接收到这个 JSON 后可以使用其中的任何值——显示温度、展示天气状况、遍历预报。

---

## 认证基础

大多数有用的 API 都需要认证——证明你有权使用它们。这能防止滥用，让 API 提供商追踪使用情况。

最常见的 API 认证形式是 **API 密钥**：一串对你唯一的字母数字字符串。发出请求时，你附上这个密钥，API 用它来识别你的身份。

API 密钥是秘密。把它们当密码对待：
- 永远不要直接写在代码里（如果你分享代码，别人可以读到）
- 存储在 `.env` 文件中（见第十四章）
- 永远不要提交到 Git
- 永远不要在公开渠道分享

`.env` 文件看起来像这样：

```
WEATHER_API_KEY=abc123def456ghi789
DATABASE_URL=postgresql://localhost/mydb
```

你的代码从环境中读取这些值，而不是把它们硬编码在里面。

---

## 教程：构建天气仪表盘

让我们一起做一个真实项目：一个简单的天气仪表盘，显示任意城市的当前天气和 5 天预报。

我们将使用 OpenWeatherMap API，它有一个非常适合学习的免费层级。

### 第一步：获取 API 密钥

访问 openweathermap.org，创建免费账号并获取你的 API 密钥。大约需要 2 分钟。

### 第二步：设置项目

打开终端：

```bash
mkdir weather-dashboard
cd weather-dashboard
claude
```

在 Claude Code 中：

```
I want to build a weather dashboard using the OpenWeatherMap API.
It should let users type a city name and see:
- Current temperature (in Fahrenheit)
- Weather condition (sunny, cloudy, etc.)
- Humidity percentage
- A 5-day forecast with high and low temperatures

Please create a simple HTML/CSS/JavaScript project for this.
Use a clean, minimal design with a blue and white color scheme.
```

Claude 会创建：
- `index.html` — 页面结构和天气显示
- `styles.css` — 视觉设计
- `app.js` — 调用 API 并更新页面的 JavaScript 代码

### 第三步：安全存储 API 密钥

```
I have my OpenWeatherMap API key. How should I store it safely for
this project?
```

Claude 会解释 `.env` 文件，并可能建议适合纯前端 JavaScript 项目的方式。对于你只在本地运行的初学者项目，Claude 会展示如何配置 API 密钥，同时不会暴露它。

### 第四步：接入 API

```
My API key is stored. Can you update the app.js file to actually call
the OpenWeatherMap API and display the results?

The API endpoint for current weather is:
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=imperial

The endpoint for 5-day forecast is:
https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={key}&units=imperial
```

Claude 会编写以下代码：
1. 从输入框获取城市名称
2. 构建 API 的 URL
3. 发出请求
4. 解析 JSON 响应
5. 用天气数据更新页面

### 第五步：优雅地处理错误

```
What happens if someone types an invalid city name, or if the API
is down? Can you add error handling so we show a friendly message
instead of crashing?
```

好的 API 处理总是考虑到失败情况。Claude 会添加：
- 对"城市未找到"响应的检查
- API 请求完全失败时的备用提示
- 加载状态，让用户知道正在处理中

### 第六步：测试

在浏览器中打开 `index.html`，输入城市名，看看是否能用。

如果出了问题：

```
I typed "London" and clicked Search but nothing happened. No error
message, no data. Here's what I see in the browser console:
[paste the console output]
```

Claude 会诊断问题并修复它。

---

## API 工作中的常见模式

### 用不同语言发出请求

Claude 几乎知道如何用任何编程语言发出 API 请求。你不需要知道语法——只需描述你想要什么：

```
Show me how to call this same weather API using Python instead of JavaScript
```

```
How would I make this request using Node.js with the axios library?
```

### 处理速率限制

大多数 API 限制你在给定时间段内发出的请求数量。如果超过限制，你会收到错误。Claude 可以帮你优雅地处理这个问题：

```
The API limits me to 60 requests per minute. Can you add rate limit
handling that waits and retries instead of failing?
```

### 分页

当 API 返回大量结果时，它通常会分"页"返回——每次给你 20 条结果，并提供请求下一个 20 条的方式。Claude 知道如何处理这种情况：

```
The API returns results in pages of 20. Can you add a "Load More"
button that fetches the next page of results and adds them to the list?
```

### 数据转换

API 响应通常需要在显示前进行整形。例如，天气 API 默认以开尔文返回温度——你可能想转换成华氏或摄氏度。或者日期以 Unix 时间戳返回，你想显示成"Monday, March 10"：

```
The API returns the date as a Unix timestamp like 1710115200.
Can you convert that to a readable format like "Monday" for the
forecast display?
```

---

## 关于免费 API 和付费 API

许多 API 有免费层级，允许你每月发出有限数量的请求。对于学习和小型项目，这些免费层级通常已经足够。

在为项目选择 API 时，Claude 可以帮你评估选项：

```
I want to add a map to my website. What are the best mapping APIs?
I'd prefer something free or cheap for a personal project.
```

Claude 会比较各个选项——Google Maps、Mapbox、Leaflet with OpenStreetMap——并根据你的需求给出推荐。

---

## 你构建了什么

本章在天气仪表盘中演示了 API 工作的完整循环：
1. 找到并注册一个 API
2. 理解 API 的文档
3. 安全存储凭据
4. 编写代码发出请求并处理响应
5. 向用户展示数据
6. 优雅地处理错误

这些技能适用于你将来遇到的每一个 API，无论是天气数据、金融数据、社交媒体、地图、支付处理还是其他任何东西。具体的端点会变，但模式保持不变。

---

**下一章：** [第十四章 — CLAUDE.md：你的 AI 说明书](./14-claude-md.md) — 如何给 Claude 持久化的指令，让它在每次对话中都按你想要的方式工作。
