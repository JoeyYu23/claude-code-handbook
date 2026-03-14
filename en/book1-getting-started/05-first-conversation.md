# Chapter 5: Your First Conversation

## Let's Actually Do Something

This chapter is different from the previous ones. We are not talking about Claude Code anymore. We are using it.

By the end of this chapter, you will have:
- Started a Claude Code session
- Asked your first question
- Watched Claude Code create a real file on your computer
- Understood what happened at each step
- Learned the most common beginner mistakes to avoid

Keep your terminal open. Let's go.

---

## Step 1: Pick a Folder to Work In

Before you start Claude Code, navigate to a folder you want to work in. This tells Claude Code where your "project" is. Everything it reads and creates will be relative to this location.

For this tutorial, let's create a fresh folder specifically for experimenting:

```bash
mkdir my-first-claude-project
cd my-first-claude-project
```

The first command creates a new folder called `my-first-claude-project`. The second command moves you inside it. You should now see your prompt showing the new folder name.

**Why does this matter?** Claude Code treats the folder you start it in as your project root. It will read files from here, create files here, and when you ask "what's in this project?" it looks here.

---

## Step 2: Start Claude Code

Now start Claude Code:

```bash
claude
```

The first time you run this (and you already logged in during installation), you will see a welcome screen. It looks something like this:

```
 Claude Code  v2.x.x

 What can I help you with?

>
```

That `>` is your prompt. Claude Code is waiting for you to type something.

If this is your very first time running Claude Code after installation, it may open a browser window for you to log in. Complete the login, return to your terminal, and you will see the same welcome screen.

---

## Step 3: Your Very First Prompt

Let's start simple. Type this and press Enter:

```
What files are in this directory?
```

Since we just created this folder, it is empty. Claude Code's response will tell you exactly that:

```
The directory is empty — no files or folders have been created yet.

Would you like me to create something, or are you planning to add files here?
```

This seems trivial, but notice what just happened: Claude Code did not guess. It did not make something up. It actually looked at your directory and reported what it found — nothing. This is Claude Code's Read tool in action.

Now let's give it something to do.

---

## Step 4: Ask Claude Code to Create a File

Type this:

```
Create a simple HTML page that says Hello World
```

Watch what happens. Claude Code will think for a moment, then show you something like this:

```
I'll create a simple HTML page for you.

Creating index.html:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f4f8;
        }
        h1 {
            color: #2d3748;
            font-size: 3rem;
        }
    </style>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>

Allow this file write? [y/n]
```

Claude Code has shown you exactly what it wants to create. It is asking your permission before writing anything. This is the permission system in action — Claude Code always shows you what it plans to do before doing it.

Type `y` and press Enter.

```
Created index.html

The Hello World page is ready. You can open it in your browser by:
- Double-clicking the file in your file manager
- Or running: open index.html (on Mac)
```

The file now exists on your computer. Go ahead and open it — you can drag it into a browser window or use the command Claude Code suggested.

You just built a web page.

---

## Step 5: Understand What Just Happened

Let's slow down and trace what Claude Code did behind the scenes when you asked for that HTML page:

1. **Claude read your message** and understood you wanted: (a) a file, (b) in HTML format, (c) with "Hello World" content.

2. **Claude decided on a file name** (`index.html` is the conventional name for a main web page).

3. **Claude composed the HTML** — not just a bare-minimum `<h1>Hello World</h1>`, but a proper page structure with a `<!DOCTYPE>`, character encoding, a title, and even basic styling to make it look nice.

4. **Claude showed you the content** and asked permission using the Write tool.

5. **When you said yes**, Claude created the file.

6. **Claude told you how to open it**, without you having to ask.

This sequence — understand intent, decide on approach, show you the plan, execute with permission, report the result — is the pattern you will see over and over.

---

## Step 6: Have a Follow-Up Conversation

Claude Code remembers the context of your conversation. You do not need to re-explain everything from scratch with each message. Try this:

```
Now add a button that changes the background color when clicked
```

Notice you did not say "add a button to the HTML page I just created." Claude Code knows what you are talking about. It will read `index.html`, add a button with JavaScript to change the background color, and ask for your permission before making the edit.

This is what makes Claude Code feel like a conversation with a collaborator rather than a series of independent queries.

---

## Step 7: Ask a Question (No Action Needed)

Not every message has to result in a file change. You can ask questions too:

```
Explain what the CSS in index.html does
```

Claude Code will read the file and give you a plain-English explanation of each CSS property — what `display: flex` does, why `justify-content: center` centers things horizontally, and so on. This is an excellent way to learn.

You can follow up with things like:

```
What would I change if I wanted the text to be blue instead of dark gray?
```

Claude Code will point you to the specific line and explain exactly what to change. You can ask it to make that change, or try it yourself for practice.

---

## The Approval Flow: What Each Response Means

When Claude Code wants to take an action, it will present something and wait for your response. Here is what your options typically are:

**`y` or just pressing Enter** — Approve this specific action. Claude Code proceeds.

**`n`** — Decline this specific action. Claude Code will not make the change and will usually ask how you would like to proceed differently.

**Typing a correction** — Instead of just `y` or `n`, you can type a modified instruction. For example, if Claude Code proposes naming a file `helper.js` but you want it named `utils.js`, type that instead of approving.

**`a` (accept all)** — For the rest of this session, approve all actions without asking each time. Use this when you are doing a long task and you trust Claude Code's judgment. Be aware that you will not see individual confirmations.

In some versions, you may see full text options like `[Yes/No/Accept All]` rather than single letters — the concept is the same.

---

## Tips for Writing Good Prompts

After years of experience watching people use AI tools, these patterns consistently produce better results:

### Be specific about what you want, not just what you have

Less effective: "Fix the bug."
More effective: "Fix the bug where clicking the button does nothing on mobile — it works on desktop."

Claude Code needs to know *what* the problem is and *how to recognize* the correct result. The more specific you are, the less it has to guess.

### Describe the outcome, not the implementation

You usually do not need to know how to do something to ask Claude Code to do it. Describe what you want the end result to look like.

Less effective: "Add a `setTimeout` with 500 milliseconds before calling `showModal()`"
More effective: "Add a small delay before the modal appears so it doesn't pop up instantly when the page loads"

Claude Code can figure out the implementation detail. Your job is to communicate the intention.

### One thing at a time (usually)

For complex tasks, breaking things into steps often works better than one giant instruction. Start with "create the file structure" before "now add all the functionality."

Exception: Claude Code handles multi-step tasks well when the steps are clearly related. "Write tests for every function in utils.js and run them" is a perfectly good single prompt.

### Use natural language

You do not need to phrase things like a terminal command or a programming specification. Speak to Claude Code the way you would speak to a capable colleague.

Fine: "yo can you make the font bigger on that heading"
Also fine: "Please increase the font size of the h1 element"
Both work.

---

## Common First-Timer Mistakes

### Mistake 1: Not reviewing what Claude Code proposes

Claude Code shows you its plan before acting. Many new users just hammer `y` on everything without reading. This works fine most of the time, but it means you miss opportunities to catch mistakes before they happen and you do not learn what Claude Code is doing.

Take a moment to read proposed changes, especially file edits. The diff format (lines starting with `-` being removed, lines starting with `+` being added) is worth learning to read quickly.

### Mistake 2: Describing the symptom without the context

"It doesn't work" is the least useful thing you can tell Claude Code. It does not know what "working" looks like, what error you are seeing, what you tried, or what changed before the problem started.

When something is broken, describe: what you expected to happen, what actually happened, and any error messages you see.

### Mistake 3: Expecting Claude Code to know things it cannot know

Claude Code knows what is in your files and what you have told it in your conversation. It does not know:
- What your project is supposed to do (unless you tell it or it reads documentation you have written)
- Business context or requirements that exist only in your head
- What happened in previous sessions (each session starts fresh unless you resume it)

If Claude Code makes choices that seem wrong, it is often because it did not have the right context. Tell it more.

### Mistake 4: Not asking follow-up questions

A common pattern for new users: Claude Code does something, it's not quite right, the user accepts it and then tries to fix it themselves — struggling for 20 minutes before giving up.

Instead, just tell Claude Code what's wrong:

```
That's close, but the button should be on the right side of the page, not the left
```

Or:

```
Can you explain why you chose to structure it that way? I was expecting something different.
```

Claude Code handles corrections gracefully. It is almost always faster to tell Claude Code what to fix than to fix it yourself.

### Mistake 5: Forgetting that conversations have history

Within a single session, Claude Code remembers everything that happened. You do not need to repeat context.

But when you start a new session (or if you ran `/clear`), that history is gone. If you are continuing work from a previous session, a brief recap helps: "I was building a to-do list app yesterday — let me catch you up on where things are."

---

## Useful Commands to Know

Before you close this chapter, here are a few commands that will come up often:

| What you type | What it does |
|---|---|
| `/help` | Shows available commands and shortcuts |
| `/clear` | Clears conversation history and starts fresh |
| `Ctrl+C` | Cancels the current operation |
| `exit` | Leaves Claude Code |
| `?` | Shows keyboard shortcuts |
| `/resume` | Pick up a previous conversation |

---

## What's Next?

You have installed Claude Code, started your first session, created a file, and learned the core interaction patterns. That is not nothing — you have used a genuinely sophisticated tool to create something real.

From here, the best thing you can do is explore. Try asking Claude Code to:
- Explain a piece of code you have never understood
- Build something simple you have wanted to make
- Help you learn a new programming concept by showing you examples
- Fix a bug that has been bothering you

Every conversation you have teaches you more about how to direct Claude Code effectively. The tool gets more useful the more you use it, not because it changes, but because you do.

---

**Next up:** [Chapter 6 — Permission Modes](./06-permission-modes.md) — Understanding auto, plan, and default modes, and when to use each.
