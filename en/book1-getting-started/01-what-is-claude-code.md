# What Is Claude Code?

> Verified on 2026-10-04 with Claude Code 2.1.289.

## Imagine this

It is 11 PM. You have inherited a project from a colleague who just left. You do not know what half of it does, and you need a new feature by Friday.

Now imagine a capable programmer sitting at your computer with you. Not someone giving advice over text, but someone who can open your files, run your programs, see the errors, change the code and run it again. Someone who works at 3 AM and does not mind explaining the same thing twice.

That is roughly what Claude Code is. The rest of this chapter makes the picture more precise, because the details decide how well it works for you.

## So what is it?

Claude Code is a coding agent made by Anthropic, the company behind the Claude chat app. Anthropic's documentation describes it as "an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools."

The important word is *agentic*. A chat assistant answers in words: it suggests code, and you copy it into your project yourself. An agent takes actions. You describe what you want, and Claude Code reads the relevant files, makes the edits, runs the tests, looks at what happened and keeps going until the job is done or it needs you.

| Chat assistant (claude.ai, ChatGPT) | Coding agent (Claude Code) |
|---|---|
| You describe the problem | It reads your actual files |
| It suggests code | It writes and edits the code |
| You copy and paste | It runs commands itself |
| You check whether it worked | It runs the checks, and you check its claim |
| One answer per message | Dozens of steps per request |

The last two rows changed the most in 2026. Today's models can work on one request for many minutes, or hours, and handle a whole feature in one go. That is useful, and it moves your job. You spend less time typing code and more time saying clearly what you want and checking that you got it.

## Where it runs

In 2026 Claude Code is one engine with several front ends. The docs call them *surfaces*. Your project's instruction file (`CLAUDE.md`), settings and connected tools work the same on all of them.

**Terminal.** The original and most complete version. You install it, open a terminal in a project folder and type:

```bash
claude
```

That starts a conversation in plain language. No special syntax. If you have never used a terminal, Chapter 4 walks you through it.

**Desktop app.** The Claude app for macOS and Windows (Linux in beta) has a **Code** tab with Claude Code built in, so you do not need the terminal at all. You pick a folder, type what you want, and review changes in a visual diff. You can run several sessions side by side and schedule recurring tasks.

**Web and mobile.** At [claude.ai/code](https://claude.ai/code), Claude Code runs on a cloud machine instead of your computer. You connect a GitHub repository, describe a task, close the tab, and come back later to a branch you can review. The Claude mobile app can start and follow these cloud sessions too.

**IDE extensions.** Extensions for VS Code (which also install in Cursor) and a plugin for JetBrains IDEs put Claude Code next to your editor, with inline diffs.

You can also move a session between surfaces. Running `/desktop` in a terminal session continues it in the desktop app, and `claude --teleport` pulls a cloud session into your terminal. Book 2's [Desktop and Web](/en/book2-advanced/19-desktop-and-web) chapter covers these in detail.

This book uses the terminal for its examples, because it shows every step plainly. Everything you learn carries over to the other surfaces.

## What it can do

A short tour. Each item gets its own chapter later.

**Explain code.** Point it at any project, even a large one, and ask what it does, how data flows, or what happens when a user logs in. It reads the real files, not a pasted fragment. (Chapter 7)

**Write and change code.** "Add a button that saves the form." "Write a function that calculates sales tax." It finds the right place, makes the change and fits it to the rest of the project. (Chapter 8)

**Run commands.** It starts servers, runs tests, installs packages and reads the output, the same commands you would type yourself. (Chapter 9)

**Work with git.** It creates branches, writes commit messages and opens pull requests. (Chapter 10)

**Check its own work.** It can run your tests, take screenshots of a web page, and tell you what it verified. You still decide whether that evidence is enough. (Chapter 12)

**Look things up.** It can search the web and read documentation pages, which matters because its training data stops at a fixed date.

**Connect to other tools.** Through MCP (the Model Context Protocol, an open standard for plugging tools into AI agents) it can read tickets, documents and databases. (Chapter 13 and Book 2)

**Work in parallel.** It can hand parts of a job to *subagents*, helper agents with their own working memory, and you can run several full sessions at once. Book 2 covers this.

## The landscape in late 2026

Claude Code is not the only coding agent, and you should know the main alternatives. The field changes monthly, so treat this as a snapshot from October 2026.

**OpenAI Codex.** OpenAI's coding agent, with a terminal CLI, a desktop app, an IDE extension and cloud environments. It runs OpenAI's GPT models; the newest at the time of writing is GPT-6.1 Sol, released 29 September 2026. It is the closest like-for-like competitor to Claude Code.

**Cursor.** A code editor built around AI, based on VS Code. It started as an editor with an assistant and has grown agent features of its own: cloud agents and, since 10 September 2026, *Cursor Projects*, where a coordinator agent splits a larger job across several agents. Cursor lets you choose among models from several companies.

**Google Antigravity CLI.** In May 2026 Google announced it was moving from Gemini CLI to Antigravity CLI, a new terminal agent that runs several agents at once in the background. Gemini CLI stopped serving individual Google AI Pro and Ultra users on 18 June 2026. Business customers with Gemini Code Assist licences keep Gemini CLI.

**GitHub Copilot.** Still the most common assistant inside editors, and it now runs agents too. Claude models, including Sonnet 5.5, are available inside Copilot.

**Open-source agents.** Tools such as OpenCode and Pi are open-source harnesses that you can point at many different models. They appeal to people who want to see and control everything the agent sends.

Many developers use more than one of these. Chapter 2 compares them honestly, including where Claude Code is weaker.

## The shift to agents

As recently as March 2026, the usual picture of Claude Code was a skilled colleague who asks before touching anything. Two things have changed since.

First, the asking has mostly stopped. Since 14 August 2026, new sessions on the Pro, Max and Team plans start in *auto mode*: a second AI model, the classifier, reviews each risky action in the background and blocks the dangerous ones, so Claude does not stop to ask you about every file edit and command. From version 2.1.283 that is the starting mode on every plan. Chapter 6 explains what this means for your safety.

Second, the work got longer. Earlier tools helped you write a function. Current agents take a feature request and come back with a branch, tests and a summary. People who use them heavily describe their job as moving from writing code to specifying it and checking it. Addy Osmani, an engineering lead at Google, calls the result "the code nobody reads": line-by-line review is fading, so the checks you set up have to carry more of the weight.

That is why this book puts *checking the work* at its center. You do not have to read every line. You do have to know how to confirm that the thing works.

## Who this book is for

**If you have never coded.** You can build real things with Claude Code by describing them in plain English. This book starts from opening a terminal. You will also learn enough to tell when something is wrong, which is the skill that keeps you safe.

**If you are a hobbyist or self-taught developer.** You will move much faster through the parts you find tedious: setup, boilerplate, tests, unfamiliar libraries.

**If you are a professional developer.** Book 1 gets you set up quickly. Books 2 and 3 cover the heavier material: subagents, hooks, running many agents, containment and cost.

**If you are a manager, designer, researcher or writer who touches code now and then.** Claude Code closes much of the gap. Describe what you need, and use the checking habits in Chapter 12 so you are not just hoping it worked.

## What it is not

Claude Code makes mistakes. It sometimes misunderstands the request, and it sometimes produces code that looks right and is subtly wrong. It can also report that something works when it has not really checked. Treat its claims the way you would treat a new colleague's: trust grows with evidence.

It is also not a replacement for judgment. It will happily build the wrong thing very well if you ask for the wrong thing. The clearer you are about what "done" looks like, the better the result.

### Check that it worked

You have nothing to install yet. To confirm you have the right picture, answer these from memory:

1. What is the difference between a chat assistant and an agent? (An agent takes actions in your environment; a chat assistant only answers.)
2. Name the four main surfaces. (Terminal, desktop app, web and mobile, IDE extensions.)
3. What is auto mode? (A starting mode where a classifier model reviews risky actions instead of asking you about each one.)

If those come easily, go on to [Why Claude Code?](/en/book1-getting-started/02-why-claude-code).

## Sources

- "Overview", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/overview
- "How Claude Code works", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/how-claude-code-works
- "Choose a permission mode", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- "What's new" (Week 32: auto mode default from 14 August 2026), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
- "Get started with the desktop app", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/desktop-quickstart
- "Get started with Claude Code in the cloud", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/web-quickstart
- "Codex changelog" (GPT-6.1 Sol, 2026-09-29), OpenAI, accessed 2026-10-04. https://learn.chatgpt.com/docs/changelog
- "Changelog" (Cursor Projects, 2026-09-10), Cursor, accessed 2026-10-04. https://cursor.com/changelog
- "An important update: transitioning Gemini CLI to Antigravity CLI", Google Developers Blog, 2026-05-19. https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/
- "Claude Sonnet 5.5 in GitHub Copilot", GitHub Changelog, 2026-09-28. https://github.blog/changelog/2026-09-28-claude-sonnet-5-5-in-github-copilot
- Addy Osmani, "The Code Nobody Reads", 2026-09-28. https://addyo.substack.com/p/the-code-nobody-reads
