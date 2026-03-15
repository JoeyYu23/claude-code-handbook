# 第十三章：对接 API

## 什么是 API？（给非技术读者）

API（Application Programming Interface，应用程序编程接口）是两个软件之间"对话"的方式。

用一个生活类比来理解：

你去餐厅吃饭，不需要自己进厨房做菜。你只需要：
1. 看菜单
2. 告诉服务员你要什么
3. 等待，然后接收菜品

**API 就是这个"服务员"。**

- 你是"顾客"（你的程序）
- 厨房是"服务提供方"（比如天气数据提供商）
- 服务员（API）负责传递请求和响应

**举例：**
- 你的网站想显示今天的天气 → 调用天气 API
- 你的应用想发送短信验证码 → 调用短信 API
- 你的程序想获取汇率数据 → 调用汇率 API

你不需要知道对方的系统内部是怎么运作的，只要按照 API 的"菜单"（文档）发出请求，就能拿到你需要的数据。

---

## 动手实战：连接天气 API

我们用一个完整例子来学习：用 Claude Code 帮你写一个显示天气的小程序。

### 准备工作

我们使用 OpenWeatherMap 提供的免费天气 API：
1. 去 [openweathermap.org](https://openweathermap.org/api) 注册免费账号
2. 获取你的 API Key（一串字母数字，类似 `a1b2c3d4e5f6...`）
3. 免费账号每天可以请求 1000 次，对练习完全够用

### 和 Claude 说你要做什么

```
我想做一个简单的天气查询程序：
- 输入城市名，显示当前温度和天气状况
- 使用 OpenWeatherMap API
- 用 Node.js 写

我已经有 API Key 了，存在 .env 文件里（变量名叫 WEATHER_API_KEY）。
帮我从头实现这个程序。
```

**Claude 会生成的代码大致如下（它帮你写，你不需要自己懂）：**

```javascript
// weather.js
const axios = require('axios');
require('dotenv').config();

async function getWeather(city) {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather`;

    const response = await axios.get(url, {
        params: {
            q: city,
            appid: apiKey,
            units: 'metric',
            lang: 'zh_cn'
        }
    });

    const data = response.data;
    console.log(`城市：${data.name}`);
    console.log(`温度：${data.main.temp}°C`);
    console.log(`天气：${data.weather[0].description}`);
    console.log(`湿度：${data.main.humidity}%`);
}

const city = process.argv[2] || '北京';
getWeather(city).catch(console.error);
```

然后在终端运行：
```bash
node weather.js 上海
```

---

## API 认证基础

大多数 API 都需要认证——证明你是谁，防止滥用。常见的认证方式有：

### API Key（最常见）

就是一串密码，放在请求里发给服务器。

**永远不要把 API Key 直接写在代码里！**

```javascript
// 错误做法 — 这样 API Key 会被别人看到
const apiKey = "a1b2c3d4e5f6g7h8";
```

```javascript
// 正确做法 — 存在 .env 文件里
const apiKey = process.env.MY_API_KEY;
```

**`.env` 文件长这样：**
```
MY_API_KEY=a1b2c3d4e5f6g7h8
ANOTHER_KEY=xyz123
```

**`.gitignore` 里要包含 `.env`，防止密钥被提交到 Git：**
```
.env
```

告诉 Claude：

```
帮我把 API Key 安全地存储，不要直接写在代码里，
要用 .env 文件和 dotenv 库。
```

### Bearer Token

另一种常见认证方式，通常用在需要登录的 API（比如 Twitter API、GitHub API）。请求时放在 Header 里：

```
Authorization: Bearer 你的token
```

---

## 处理 API 响应

API 返回的数据通常是 JSON 格式——一种结构化的文本数据。

**原始 JSON 响应（天气 API 返回的部分数据）：**

```json
{
    "name": "Shanghai",
    "main": {
        "temp": 22.5,
        "humidity": 65
    },
    "weather": [
        {
            "description": "晴天",
            "icon": "01d"
        }
    ]
}
```

你可以问 Claude：

```
这个 API 返回的 JSON 数据我不太看得懂，帮我解释
一下结构，以及如何提取"城市名"和"温度"这两个值。
```

---

## 用 API 做一个完整的小项目

我们来做一个稍复杂的项目：**汇率转换工具**。

### 项目需求

- 输入金额和两种货币（比如：100 美元换成人民币多少？）
- 调用免费的汇率 API 获取实时汇率
- 显示转换结果

### 完整对话流程

**第一步：告诉 Claude 目标**

```
我想做一个命令行汇率转换工具。

功能：
- 用法：node convert.js 100 USD CNY
  （意思：100 美元换成多少人民币）
- 调用 exchangerate-api.com 的免费 API
- 显示转换结果和当前汇率

我会去注册一个免费 API Key。
帮我写这个程序，同时告诉我要安装哪些依赖。
```

**第二步：Claude 帮你写代码并安装依赖**

```
需要安装：
$ npm install axios dotenv

是否允许运行这个命令？
```

确认后，Claude 生成代码文件，你运行：

```bash
node convert.js 100 USD CNY
```

**第三步：改进功能**

```
现在运行没问题了。帮我加以下功能：
1. 如果货币代码输入错误，显示友好的错误提示
2. 支持显示多个目标货币（比如同时显示人民币和欧元）
3. 显示汇率的更新时间
```

**第四步：处理异常情况**

```
帮我完善错误处理：
- API Key 无效时，提示用户检查 .env 文件
- 网络请求失败时，给出重试建议
- 参数格式错误时，显示使用说明
```

---

## API 调试技巧

### 先测试 API 本身

在写代码之前，可以直接在终端测试 API 是否正常：

```
帮我用 curl 命令测试一下这个 API 是否有效：
https://api.openweathermap.org/data/2.5/weather?q=Beijing&appid=我的key
```

这样可以先排除 API 本身的问题，再写代码。

### 看懂 API 文档

API 文档往往很长，英文还有很多术语。

```
帮我解读这段 API 文档，告诉我：
1. 这个接口是做什么的
2. 必填参数有哪些
3. 返回值里哪些字段有用

[粘贴 API 文档片段]
```

### 常见 API 错误码

| 状态码 | 含义 | 常见原因 |
|--------|------|----------|
| 200 | 成功 | 一切正常 |
| 400 | 请求格式错误 | 参数缺失或格式不对 |
| 401 | 未认证 | API Key 错误或未提供 |
| 403 | 无权限 | 权限不足或 Key 被禁用 |
| 404 | 找不到 | URL 写错，或请求的资源不存在 |
| 429 | 请求太频繁 | 超过限额，需要等待 |
| 500 | 服务器错误 | 对方系统问题 |

遇到这些错误码，直接告诉 Claude：

```
API 返回了 401 错误，这是什么意思？怎么排查？
```

---

## 安全注意事项

处理 API 时，有几个必须记住的安全原则：

**1. API Key 绝不入代码库**
永远用 `.env` 文件存储，确保 `.env` 在 `.gitignore` 里。

**2. 不要在前端代码暴露 API Key**
如果你做网页应用，不要在浏览器端直接调用需要 Key 的 API——用户能在浏览器开发者工具里看到你的 Key。应该通过自己的服务器中转请求。

**3. 注意 API 的使用限制**
免费 API 通常有请求次数限制。写代码时要考虑缓存结果，避免不必要的重复请求。

遇到安全问题可以问：

```
我的应用需要在前端显示地图，但 Google Maps API Key 不能暴露，
帮我想一个安全的解决方案。
```

---

## 小结

- **API 就是服务员**：帮你的程序和外部数据源"对话"
- **API Key 要保密**：存在 `.env` 文件，绝不写死在代码里
- **JSON 不用手动解析**：让 Claude 帮你写提取数据的代码
- **错误处理很重要**：网络不稳定、Key 过期、超出限额都要考虑
- **先测试再写代码**：用 curl 或浏览器先确认 API 能用

API 是现代编程的重要组成部分。通过 Claude Code，即使没有深厚的技术背景，你也能完成基本的 API 对接工作。

---

**下一章：** [CLAUDE.md — AI 的说明书](./14-claude-md.md)
