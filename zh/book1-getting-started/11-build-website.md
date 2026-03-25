# 第十一章：搭建一个简单网站 — 实战教程

## 我们要做什么

本章是一个完整教程。你将只用 Claude Code 从零开始搭建一个个人作品集网站——不需要任何 web 开发经验。

完成后，你将拥有：
- 一个包含多个页面的真实网站
- 你自己的样式和内容
- 在手机上也能良好显示的响应式设计
- 一个可以分享的在线地址（通过 GitHub Pages）

我们将一步步完成，并展示完整的对话过程，让你看到如何与 Claude Code 交互。你可以直接跟着做，用你自己的姓名和内容替换示例中的内容。

---

## 开始前的准备

确保你已经：
1. 安装了 Claude Code（见第四章）
2. 打开了终端
3. 安装了 Git（`git --version` 检查）
4. 有一个 GitHub 账号（在 github.com 免费注册）

你不需要了解 HTML、CSS 或 JavaScript。Claude 负责写代码，你的任务是描述你想要什么。

---

## 第一步：创建文件夹并启动 Claude Code

打开终端，运行：

```bash
mkdir my-portfolio
cd my-portfolio
git init
claude
```

最后一条命令启动 Claude Code。你会看到提示符在等待你的第一条消息。

---

## 第二步：请求基本结构

输入这条第一条消息：

```
I want to build a personal portfolio website. It should have:
- A home page with my name, a brief intro, and a photo placeholder
- An "About Me" page with more detail about my background
- A "Projects" page showing 3 example projects
- A "Contact" page with a simple contact form

Please create the basic file structure and a home page to start.
Use clean, modern styling with a dark navy color scheme.
```

Claude 会提议创建几个文件。第一个是 `index.html`（首页）。查看它展示的内容，按 `y` 批准每个文件。

你应该得到：
- `index.html` — 首页
- `about.html` — 关于页面骨架
- `projects.html` — 项目页面骨架
- `contact.html` — 联系页面骨架
- `styles.css` — 所有页面的共享样式

---

## 第三步：在浏览器中打开

文件创建好后，打开首页：

```
Open index.html in my browser
```

在 Mac 上，Claude 会运行 `open index.html`；在 Windows 上，它会建议你双击文件。看看生成的效果。

你将看到一个带导航链接、照片占位符和一些默认文字的功能页面，已经有了样式。接下来开始个性化定制。

---

## 第四步：个性化内容

告诉 Claude 关于你自己的信息：

```
Update the home page with my actual information:
- Name: Alex Rivera
- Title: Graphic Designer and Illustrator
- Intro: "Hi, I'm Alex. I create visual identities and illustrations that
  bring brands to life. Based in Austin, Texas."
- Change the color scheme from navy to a warm terra cotta with cream
  background
```

Claude 会编辑 `index.html` 和 `styles.css` 以反映你的内容和更新后的颜色。查看并批准每个改动。

如果视觉效果有问题，直接描述：

```
The heading font is too large on mobile — can you reduce it?
```

```
The navigation links are too close together. Add more spacing.
```

持续给出反馈，直到满意为止。

---

## 第五步：完善项目展示页

现在为项目页面添加真实内容：

```
Fill out the projects page with 3 portfolio pieces:

1. "Sunrise Coffee Rebrand" — logo and identity system for a local
   coffee shop. Category: Brand Identity.

2. "WildCraft Magazine" — editorial illustrations for an outdoor
   lifestyle publication. Category: Illustration.

3. "Bloom Florist App" — UI design and illustration for a flower
   delivery app. Category: UI Design.

For each project, include a placeholder image area, the title,
category, and a brief 2-sentence description. Make the layout
a 3-column grid on desktop, single column on mobile.
```

Claude 会更新 `projects.html`，添加这些内容并应用响应式网格布局。"占位图区域"会是一个彩色矩形——你以后可以用真实截图替换。

---

## 第六步：完成关于和联系页面

```
Update the about page with:
- A longer bio: "Alex Rivera is a graphic designer and illustrator
  with 5 years of experience working with small businesses and
  startups. She studied Visual Communication at UT Austin and has
  worked with clients across food, fitness, and tech industries."
- A "Skills" section listing: Brand Identity, Typography,
  Illustration, Figma, Adobe Suite, UI Design
- An "Experience" timeline with 2 previous roles
```

对于联系页面：

```
Make the contact form functional with fields for: name, email,
subject, and message. Style it to match the rest of the site.
Add my email address "alex@example.com" and links to Instagram
and LinkedIn (use placeholder # links for now).
```

---

## 第七步：实现响应式设计

响应式网站在手机、平板和桌面上都能正常显示。请 Claude 检查并改善：

```
Review the site for responsiveness. Check all four pages on a
narrow screen and fix any layout issues — text that overflows,
images that are too wide, navigation that breaks, etc.
```

Claude 会通读 CSS 和 HTML，找出潜在的响应式问题，并提出修复方案。它可能会添加媒体查询（只在特定屏幕尺寸下生效的 CSS 规则）或重新整理某些元素的布局。

要在移动设备上真正测试，你可以打开 Chrome 的开发者工具（F12）并切换设备模拟模式。或者直接拿起手机，如果在同一局域网内就能打开文件。

---

## 第八步：添加精致感

细节能让作品集大幅提升：

```
Add smooth hover effects to the navigation links and project cards.
When hovering, the links should change color with a 0.2 second
transition, and project cards should lift slightly with a subtle shadow.
```

```
Add a favicon — a small icon that appears in the browser tab.
Use a simple circle with my initials "AR" in it.
```

```
Make the page transitions smooth by adding a subtle fade-in when
each page loads.
```

每一处都是小改动，但合在一起让网站感觉更精致专业。

---

## 第九步：提交你的成果

部署前，用 Git 保存所有内容：

```
Commit everything I have built today with an appropriate message
```

Claude 会暂存所有文件并创建提交。然后：

```
Show me all the files in the project and confirm git is tracking everything
```

---

## 第十步：部署到 GitHub Pages

GitHub Pages 可以直接从 GitHub 仓库免费托管静态网站。让我们把你的网站上线。

首先需要创建一个 GitHub 仓库。如果你安装了 `gh` CLI：

```
Create a new GitHub repository called "portfolio" and push my site to it
```

Claude 会创建仓库、添加远端，并推送代码。

如果你没有安装 `gh`，可以：
1. 去 github.com 创建一个名为 "portfolio" 的新仓库
2. 回到 Claude："I created a repo at github.com/your-username/portfolio. Push my code there."

代码上传到 GitHub 后：

```
Set up GitHub Pages to host this site from the main branch
```

Claude 会引导你（或执行）GitHub Pages 的设置。几分钟内，你的网站就会在 `https://your-username.github.io/portfolio` 上线。

---

## 对话实录：真实的来回过程

下面是样式调整阶段的实际对话示例：

```
Me: The project cards look too plain. Can you add something to make
them more visually interesting?

Claude: I'll enhance the project cards. I'll add:
- A colored top border that uses your terra cotta accent color
- A subtle gradient background instead of flat white
- Better spacing between elements

Editing projects.html:
[shows diff]
Allow edit? y

Editing styles.css:
[shows diff with new CSS for card styling]
Allow edit? y

The cards now have more visual hierarchy. Take a look and let me
know if you want to adjust the colors or proportions.

Me: I like it but the gradient is too subtle — can you make it
slightly stronger?

Claude: I'll increase the gradient contrast.

Editing styles.css:
[shows diff — changes gradient from 5% opacity to 12%]
Allow edit? y

Done. The gradient is more visible now. Does that feel right?

Me: Perfect. Now the contact form looks different from the rest of
the site — the fonts don't match.

Claude: Good catch. The form is using the browser default font
instead of your site font. Let me fix that.

Editing styles.css:
[shows diff adding font-family to form elements]
Allow edit? y

Updated. The form now uses the same typography as the rest of your site.
```

这种来回节奏——Claude 做一个改动，你查看，你给出具体反馈，Claude 调整——是用 Claude Code 做设计工作的自然流程。

---

## 你学到了什么

通过搭建这个作品集，你练习了：
- 从零开始创建项目结构
- 通过对话迭代设计
- 给出 Claude 能执行的反馈
- 用 Git 保存进度
- 部署一个真实网站

这些是你在未来所有项目中都会用到的技能——具体技术会变，但工作流程保持不变。描述你想要什么，查看 Claude 的成果，给出反馈，重复。

你的作品集网站现在已经存在了。继续完善它：添加你的真实项目、上传你的真实照片、写下你的真实简介。结构已经就绪——内容属于你。

---

**下一章：** [第十二章 — 像专家一样调试](./12-debugging.md) — 如何用 Claude 诊断和修复错误、读懂错误堆栈，以及走出困境。
