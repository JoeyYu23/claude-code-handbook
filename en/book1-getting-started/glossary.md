# Glossary

A plain-language reference for terms you will encounter in this book and throughout the Claude Code ecosystem. Technical jargon translated into everyday language.

---

## A

**Agent**
A program that can take actions — not just produce text — to complete tasks. Claude Code is an agent: it reads files, runs commands, edits code, and makes git commits. Compare to a regular chatbot, which only produces text for a human to act on.

**Agentic**
Describing a program that can take autonomous actions. When Claude Code "acts agentically," it is completing a multi-step task by running tools and making decisions, not waiting for a human at every step.

**API (Application Programming Interface)**
A defined way for one program to talk to another. When your weather app shows the current temperature, it is using a weather service's API to ask "what is the weather right now?" APIs define what questions you can ask and what format the answers come in. See Chapter 13.

**API key**
A secret string of characters that identifies you when calling an API. Like a password, but for apps. Must be stored securely and never committed to git.

**Auto memory**
A feature where Claude Code automatically saves notes about your project — build commands, workflow preferences, architectural discoveries — that are loaded at the start of future sessions. See Chapter 15.

**Auto-accept mode**
A permission mode where Claude Code applies file edits without asking for approval on each one. Useful for bulk changes when you trust Claude's direction. Activated with `Shift+Tab`. See Chapter 6.

---

## B

**Bash**
The most common Unix shell (command-line interpreter). When Claude Code runs commands on your computer, it typically runs them in Bash. The `!` prefix in Claude Code lets you run Bash commands directly.

**Branch (git)**
An independent line of development in a git repository. Creating a branch lets you work on a feature or bug fix without affecting the main codebase. When the work is done, you merge the branch back in. See Chapter 10.

**Build**
The process of converting your source code into a form that can be run or deployed. A "build command" is what triggers this process (like `npm run build`).

---

## C

**CI/CD (Continuous Integration / Continuous Deployment)**
Automated processes that run tests and deploy code whenever changes are pushed to a repository. Claude Code can be used inside CI/CD pipelines.

**CLI (Command-Line Interface)**
A text-based way of interacting with a program by typing commands. Claude Code's terminal interface is a CLI. Contrasted with a GUI (Graphical User Interface), which uses visual elements like buttons and menus.

**CLAUDE.md**
A Markdown file that gives Claude Code persistent instructions for a project, your personal workflow, or your entire organization. Claude reads it at the start of every session. See Chapter 14.

**Commit**
A saved snapshot of your project's state in git. Each commit has a message describing what changed and why. "Committing" means creating this snapshot. See Chapter 10.

**Context window**
The total amount of text Claude can "see" and hold in its working memory at one time. Think of it like a desk — there is only so much you can have laid out at once. Long conversations or large files consume more of the context window.

**Conventional Commits**
A widely-used standard for writing git commit messages. Messages follow the format `type: description` where type is something like `feat`, `fix`, `docs`, or `chore`. Claude Code uses this format when writing commit messages.

---

## D

**Default mode**
The standard permission mode in Claude Code where Claude asks for permission before editing files or running commands. The safe starting point for most work. See Chapter 6.

**Denylist**
A list of tools or commands that Claude Code is never allowed to use, regardless of other settings. Created using `deny` rules in your settings file. See Chapter 6.

**Dependency**
A library or package that your project needs to function. Dependencies are listed in files like `package.json` (JavaScript) or `requirements.txt` (Python) and installed by running commands like `npm install`.

**Diff**
A view showing what has changed between two versions of a file. Lines starting with `-` are removed; lines starting with `+` are added. Claude Code shows you diffs of proposed edits before applying them. See Chapter 8.

**Directory**
A folder. "Navigate to a directory" means "go to a folder" in your terminal.

---

## E

**Environment variable**
A value stored in your system's environment, accessible to programs but not hardcoded in their source files. API keys and database passwords are typically stored as environment variables. Defined in `.env` files. See Chapter 13.

**.env file**
A file containing environment variables for your project. Typically gitignored (not committed to version control) because it contains secrets. Named literally `.env` with no file extension.

---

## F

**File path**
The location of a file on your computer, described as a series of directories separated by `/`. Absolute paths start from the root (`/Users/alice/project/src/app.js`). Relative paths start from the current directory (`./src/app.js`).

**Fork (git)**
Creating a copy of a repository that you control independently. On GitHub, "forking" is how you make your own copy of someone else's project to modify.

---

## G

**Git**
A version control system that tracks changes to your files over time. Lets you view history, undo changes, work on multiple features simultaneously, and collaborate with others. See Chapter 10.

**.gitignore**
A file that tells git which files to ignore. Common entries: `.env` (secrets), `node_modules` (installed packages), compiled output. Files in `.gitignore` are not tracked or committed.

**GitHub**
A website for hosting git repositories and collaborating on code. Provides pull requests, issue tracking, and project management on top of git.

**Glob pattern**
A simplified pattern-matching syntax used to match file paths. `*` matches anything within one directory level; `**` matches recursively. Example: `src/**/*.js` matches all `.js` files anywhere under `src/`.

---

## H

**Headless mode**
Running Claude Code in a non-interactive, scriptable way using the `-p` flag. No interface — just input in, output out. Useful for automation and scripts.

**Hook**
A custom command that runs automatically at specific points in Claude Code's workflow — before a tool use, after a file edit, when a commit is made, etc. Hooks are configured in settings files.

**HTML (HyperText Markup Language)**
The language used to define the structure of web pages. Every website is built on HTML. See Chapter 11.

---

## I

**IDE (Integrated Development Environment)**
A code editor with built-in tools for running, debugging, and managing code. VS Code, Cursor, and JetBrains products are IDEs. Claude Code has extensions for all of them. See Chapter 16.

---

## J

**JavaScript**
The programming language that runs in web browsers and powers interactive websites. Also runs on servers via Node.js. The most widely used programming language in the world.

**JSON (JavaScript Object Notation)**
A text format for storing and transmitting structured data. API responses are usually JSON. It looks like: `{"name": "Alice", "age": 30}`.

---

## L

**Library**
Pre-written code that you can use in your project. Instead of writing common functionality from scratch, you use a library that already implements it. Also called a "package" or "dependency."

---

## M

**Markdown**
A simple text formatting syntax. This book is written in Markdown. `**bold**` becomes **bold**, `# Heading` becomes a heading. CLAUDE.md files use Markdown.

**MCP (Model Context Protocol)**
An open standard for connecting Claude Code to external tools and data sources. With MCP servers, Claude can access databases, read design documents in Google Drive, update tickets in Jira, and more.

**Merge**
Combining changes from one git branch into another. A "merge conflict" occurs when the same part of a file was changed in both branches in incompatible ways. See Chapter 10.

**Modal**
A popup window or dialog that appears over the main interface, requiring attention before you can continue.

---

## N

**Node.js**
A runtime that lets you run JavaScript outside a web browser — on servers or on your own computer. Many development tools (including Claude Code) are built on Node.js.

**npm (Node Package Manager)**
The default package manager for Node.js projects. Used to install JavaScript packages and run scripts defined in `package.json`.

---

## P

**Package**
Another word for a library or dependency. A bundle of code you install and use in your project.

**Package manager**
A tool for installing, updating, and managing packages. `npm`, `yarn`, and `pnpm` are JavaScript package managers. `pip` is Python's. `brew` is macOS's.

**Permission mode**
One of Claude Code's modes that controls how it asks for approval when using tools. The main modes are default, auto-accept, plan, and bypass. See Chapter 6.

**Plan mode**
A permission mode where Claude Code can read and analyze your code but cannot modify anything. Claude produces a plan for you to review before it takes action. See Chapter 6.

**Prompt**
Your message to Claude Code. The text you type to tell Claude what you want. Also refers to the `>` character in the terminal that indicates Claude is waiting for input.

**Pull request (PR)**
A proposal to merge your branch into the main codebase, typically reviewed by others. The standard way to contribute changes to a shared repository. Claude Code can create pull requests automatically. See Chapter 10.

---

## R

**Refactoring**
Improving the structure, readability, or organization of code without changing what it does. "Refactor the login function" means make the code better, not add new functionality.

**Repository (repo)**
A project tracked by git, including all its files and history. "The project's repository" is where all the code and its history live.

**REST API**
The most common style of web API. REST APIs use HTTP methods (GET, POST, PUT, DELETE) and URLs to define operations. The weather API in Chapter 13 is a REST API.

---

## S

**Session**
A single conversation with Claude Code, from when you start it to when you exit. Sessions can be resumed later with `claude --resume`.

**Shell**
A program that interprets your terminal commands. Bash and Zsh are common shells on Unix systems. PowerShell is common on Windows.

**Slash command**
A command you type in Claude Code starting with `/`. Examples: `/help`, `/clear`, `/memory`, `/permissions`. See the Keyboard Shortcuts appendix for a full list.

**SSH**
A protocol for securely connecting to remote computers. Used when deploying code or accessing servers.

**Stack trace**
The list of function calls that were active when a crash occurred. Reading a stack trace from bottom to top shows you the path from the outermost code to the exact line where the error happened. See Chapter 12.

**Static site**
A website made of plain HTML, CSS, and JavaScript files that can be served directly without a server running code. The portfolio built in Chapter 11 is a static site.

---

## T

**Terminal**
A text-based interface for interacting with your computer by typing commands. Also called "command line" or "command prompt." Claude Code runs in your terminal. See Chapters 1 and 4.

**Token**
The basic unit Claude uses to process text. Roughly, one token is about 4 characters or 3/4 of a word. Tokens affect billing (you pay per token with the API) and context window limits.

**Tool**
In Claude Code, a tool is a specific capability Claude can invoke: reading files (Read tool), editing files (Edit/Write tools), running commands (Bash tool), searching the web (WebSearch tool). You control which tools Claude can use and when.

**TypeScript**
A version of JavaScript that adds type checking. TypeScript code catches many common bugs before they run. All TypeScript is compiled to JavaScript before running.

---

## V

**Version control**
A system that tracks changes to files over time, allowing you to view history and revert to previous states. Git is the most popular version control system.

**VS Code (Visual Studio Code)**
A free, open-source code editor made by Microsoft. The most widely used code editor in the world. Has an official Claude Code extension. See Chapter 16.

---

## W

**Working directory**
The folder your terminal is currently "in." Commands run relative to the working directory. When you start Claude Code, the working directory is your project root.

---

## Y

**YAML**
A text format for configuration files, popular for settings and build configuration. Uses indentation to show structure. You may encounter `.yaml` or `.yml` files in projects.

**yolo mode**
An informal name sometimes used for Claude Code's bypass permissions mode, where all permission prompts are skipped. Should only be used in safe, isolated environments. See Chapter 6.

---

*This glossary covers terms used in Book 1. Additional terms specific to advanced topics appear in Book 2.*
