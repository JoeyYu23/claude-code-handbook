# Chapter 3: How It Works — The Mental Model

## You Don't Need to Know Everything

Before we dive in, a reassurance: you do not need to understand how Claude Code works at the engineering level to use it effectively. You do not need to understand how a car engine works to drive.

But having the *right mental model* — a simple, accurate picture of what is happening — makes you dramatically better at using any tool. You will write better prompts, make better decisions about when to use which approach, and troubleshoot more effectively when something goes wrong.

This chapter gives you that mental model. Everything here is real and accurate, but explained without jargon.

---

## The Conversation Model

At its core, Claude Code is a conversation. You say something, Claude responds and takes action, you react to what happened, and so on. This is not a new concept — it is how you use any chat interface. But with Claude Code, the responses are not just text. They are *actions*.

When you say "create a file called hello.txt with the words Hello World in it," Claude Code does not respond with "Sure! Here is how you would do that..." It actually creates the file. When you say "run my tests," it runs your tests, reads the output, and tells you what happened.

This makes it feel less like talking to a tool and more like working with someone. Your natural instinct — to describe what you want, react to what happens, ask follow-up questions — is exactly the right way to interact with Claude Code.

---

## Tools: What Claude Code Can Actually Do

Claude Code has a set of **tools** — specific capabilities it can invoke when appropriate. Understanding these tools helps you understand what Claude Code can and cannot do, and how to ask for things effectively.

Think of tools as the hands and eyes of an assistant. Without them, an assistant can only think and talk. With them, they can reach out and interact with the world.

Here are the main tools:

---

### Read — The "Eyes" Tool

Claude Code can open and read any file on your computer. It reads source code, configuration files, text files, and more.

**Analogy:** Imagine handing your assistant a physical stack of papers and saying "read through all of these." They go through page by page, then can answer questions about what they found.

When Claude Code reads your files, it is not just skimming for keywords. It understands the *meaning* of the code — what functions do, how files relate to each other, what data flows where. This is what allows it to give answers that fit your specific codebase, not generic answers about how code "usually" works.

**Example trigger:** When you ask "What does the `calculateTotal` function do?" — Claude Code reads the file where that function lives and explains it in plain language.

---

### Edit — The "Writing" Tool

Claude Code can modify files that already exist. It makes precise, targeted changes — editing just the lines that need to change, without disturbing the rest of the file.

**Analogy:** Imagine giving your assistant a document and saying "change paragraph 3 to say this instead." They open the document, find paragraph 3, replace it, and save. They do not retype the whole document.

Claude Code's edits are shown to you before they are applied. You see exactly what will change (in a "diff" format — lines being removed shown in red, lines being added shown in green). You approve before the change is made.

**Example trigger:** When you ask "rename the `calculateTotal` function to `computeOrderTotal` everywhere it appears" — Claude Code finds every file that uses that function and makes the rename precisely.

---

### Write — The "Creation" Tool

Claude Code can create brand new files from scratch. A new Python script, a new HTML page, a new configuration file — it writes the content and saves it to disk.

**Analogy:** Asking your assistant to draft a new document and put it in a specific folder.

**Example trigger:** When you ask "create a new file called `utils.js` with helper functions for formatting dates and currency" — Claude Code writes the entire file with working, well-structured code.

---

### Bash — The "Hands" Tool

This is the most powerful and potentially the most surprising tool. Claude Code can run actual terminal commands on your computer.

**Analogy:** Imagine your assistant can not only read documents and type, but also physically press buttons on your computer — start programs, run scripts, install software, check what is running.

This is how Claude Code can:
- Run your test suite (`npm test`, `python -m pytest`, etc.)
- Start a development server
- Install a library (`npm install some-library`)
- Run a build process
- Query git history
- Check which files have changed

Because this tool is so powerful, Claude Code is careful with it. It shows you the command it wants to run and asks for your approval before executing anything that could be destructive or irreversible.

**Example trigger:** When you ask "run my tests and tell me if they pass" — Claude Code executes your test command, reads the output, and summarizes the results.

---

### Web Search — The "Research" Tool

Claude Code can search the internet in real time. This matters because software development constantly involves looking things up — library documentation, error messages, recent changes to an API, security advisories.

**Analogy:** Your assistant can step away from your desk, go look something up in a library or online, and come back with what they found.

Without web search, Claude Code is limited to what it learned during training — which has a knowledge cutoff date. With web search, it can find information about a library released last month, a bug that was patched last week, or syntax that changed in the latest version.

**Example trigger:** When you ask "what is the latest stable version of React and what changed from the previous version?" — Claude Code searches the web and returns current, accurate information.

---

## The Context Window: Your Shared Whiteboard

One of the most important things to understand about Claude Code is the concept of the **context window**.

Imagine a physical whiteboard in a meeting room. Everything you write on that whiteboard stays visible and can be referenced by everyone in the room. But the whiteboard has a fixed size — when it gets full, you have to erase old notes to write new ones.

Claude Code's context window works the same way. It is the "working memory" of your conversation — everything Claude Code currently knows about your session. This includes:

- Your messages and Claude's responses
- The contents of files Claude has read
- The output of commands that have been run
- The history of changes made so far

The context window has a size limit. On long, complex sessions — especially ones that involve reading many large files — you may approach this limit. When that happens, Claude Code may "forget" earlier parts of your conversation.

**Practical tips:**
- Start a new conversation (`/clear`) when switching to a completely different task
- Be specific about which files are relevant rather than asking Claude Code to read your entire codebase at once
- If Claude Code seems to have forgotten something it knew earlier, restate it

---

## The Permission System: Claude Asks Before Acting

One of the most reassuring design choices in Claude Code is its **permission system**. Claude Code is designed to ask for your approval before taking any action that could have significant consequences.

This is especially important for the Bash tool (running commands) and the Edit/Write tools (modifying files). Before Claude Code does any of these things, it shows you what it plans to do and waits for a "yes" from you.

There are three levels of how this works:

**Default behavior (recommended for most people):** Claude Code asks before reading files in new directories, before editing files, and before running any command. You confirm each action individually.

**"Accept all" mode:** You can tell Claude Code "go ahead and do everything without asking me each time" for a session. This is faster for tasks where you trust Claude Code's judgment, but you lose visibility into each step.

**"Plan" mode:** Claude Code first describes everything it plans to do — without doing any of it — and waits for your approval of the whole plan before starting. This is useful for complex, multi-step tasks where you want to review the approach before any changes are made.

Think of it this way: Claude Code is a contractor working in your home. A good contractor does not start knocking down walls the moment they arrive. They show you the plan, confirm you are happy, and check in when they encounter something unexpected.

---

## The Agentic Loop: How Claude Code Thinks

Here is the complete picture of what happens between when you press Enter and when Claude Code responds:

```
You type a message
        |
        v
Claude reads your message and thinks about what to do
        |
        v
Claude decides to use a tool (Read, Edit, Write, Bash, or Search)
        |
        v
[If the tool needs permission, Claude shows you and waits]
        |
        v
Claude uses the tool and gets a result
        |
        v
Claude thinks about the result — was it what was expected?
        |
        v
[If more tools are needed, Claude uses them (repeating the loop)]
        |
        v
Claude summarizes what happened and responds to you
        |
        v
You see the result and respond
```

This loop can go around many times in response to a single message. When you ask "fix the failing tests," Claude Code might:

1. Run the tests to see which ones fail
2. Read the failing test files to understand what they expect
3. Read the source files being tested to understand what currently happens
4. Edit the source files to fix the issue
5. Run the tests again to confirm they now pass
6. Report back to you

All of that happens automatically, in sequence, within a single response. You asked one thing; Claude Code handled all the steps.

---

## Putting It Together: A Visual Summary

```
Your Computer
+------------------------------------------+
|                                          |
|  Your Files    Your Terminal   The Web   |
|       |              |           |       |
|       |              |           |       |
|  +----+----+  +------+---+  +---+----+  |
|  |  Read   |  |  Bash    |  | Search |  |
|  |  Edit   |  | (Run     |  | (Look  |  |
|  |  Write  |  |  commands|  |  things|  |
|  +---------+  +----------+  |  up)   |  |
|       ^              ^       +--------+  |
|       |              |           ^       |
|       +------+-------+-----------+       |
|              |                          |
|     Claude Code (the AI brain)          |
|              |                          |
|              | (shows you what          |
|              |  it's doing,             |
|              |  asks permission)        |
|              |                          |
|           You (in the terminal)         |
+------------------------------------------+
```

Claude Code sits between you and your computer's capabilities. It understands your natural language instructions, translates them into the right tool actions, executes them (with your approval), and reports back in natural language.

---

## The Key Mental Model: A Capable, Honest Collaborator

If you walk away from this chapter with one idea, let it be this:

Claude Code is not a search engine. It is not a code generator you copy from. It is not a magic wand.

It is a **capable, honest collaborator** that can take real actions in your environment, shows you what it is doing, asks when it is unsure, and makes mistakes like any collaborator does. Your job is to direct it clearly, review its work, and correct it when it goes wrong.

The better you understand what it can see (your files), what it can do (the tools), and what it cannot know (things outside your project and outside its training), the better you will become at working with it.

---

**Next up:** [Chapter 4 — Installation](./04-installation.md) — Getting Claude Code running on your Mac, Windows, or Linux machine, step by step.
