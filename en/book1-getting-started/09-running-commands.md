# Chapter 9: Running Commands

## What the Terminal Can Do

If you have not used a terminal much before, here is a quick orientation: the terminal is a text-based interface for controlling your computer. Instead of clicking icons, you type commands. Instead of menus, you type what you want to do.

Developers use the terminal because many powerful tools live there — build systems, test runners, package managers, version control, deployment tools — and because complex operations that would take many menu clicks can be expressed in a single command.

Claude Code can run terminal commands on your behalf. This transforms it from a code editor into a genuine assistant that can take real action: install a library, run your tests, start a development server, check the status of your project. Not just suggest — actually do.

This chapter explains how that works, when it is useful, and how to stay in control.

---

## How Claude Uses the Terminal

When Claude needs to run a command, it uses its Bash tool. Before running anything, it will show you exactly what it plans to execute and ask for your permission:

```
I need to install the date-fns library.

Running: npm install date-fns

Allow this command? [y/n]
```

You see the exact command before it runs. No surprises.

After you approve, Claude runs the command and reads the output. It uses that output to understand what happened — whether the command succeeded, what it printed, whether there were errors — and then continues with the task or tells you what it found.

This feedback loop is powerful. Claude can react to real results rather than guessing. If a command fails, Claude sees the error message and can try a different approach.

---

## Common Use Cases

### Installing packages

```
Install the axios library for making HTTP requests
```

Claude will run the appropriate install command for your project (`npm install axios`, `pip install requests`, `yarn add axios`, etc.) and confirm it succeeded.

### Running tests

```
Run the tests and tell me if any are failing
```

Claude runs your test suite, reads the output, and tells you which tests passed and which failed. If tests fail, it can often identify why and propose a fix.

```
Run just the tests in the auth module
```

Most test frameworks support running specific test files or directories. Claude will figure out the right command for your setup.

### Starting a development server

```
Start the development server so I can preview my changes
```

Claude will run the appropriate start command (`npm run dev`, `python manage.py runserver`, `rails server`, etc.). Note that for long-running processes like development servers, Claude typically starts them and reports back, but the server runs in the background.

### Building your project

```
Build the project and tell me if there are any errors
```

Claude runs the build command, reads the output, and reports on success or failure. If there are compilation errors, it reads them and can fix them.

### Checking project status

```
What is the current git status of this project?
```

```
Show me which files have been modified recently
```

Claude can run informational commands (`git status`, `git log`, `ls -la`) to gather information and report back to you.

### Database operations

```
Run the database migrations
```

```
Seed the database with test data
```

For projects with databases, Claude can run migration and seeding commands that set up or update your database schema.

---

## Understanding Command Output

When Claude runs a command, it reads the output — the text the command prints to the screen — and incorporates that into its understanding. For you, this means:

**You can ask Claude to explain output:**

```
I ran the build and got a bunch of warnings. What do they mean?
```

**Claude uses output to diagnose problems:**

If a command fails, Claude sees the error message and can usually tell you what went wrong:

```
The npm install failed with an error about peer dependencies. Let me look at that...
```

**You can see the output too:**

Whatever Claude runs, you see the real terminal output. You are not in a black box — the full text of every command and every response is visible in your terminal.

---

## Long-Running Commands

Some commands take a while. Tests might run for 30 seconds. A build might take several minutes. A database seed might be even longer.

Claude Code handles these by running them and waiting for completion before proceeding. While waiting, you will typically see the live output streaming to your terminal.

If you start a command and change your mind, press `Ctrl+C` to cancel it.

For long-running processes that should keep running (like a development server), Claude may start them and note that they are running in the background, then proceed with other tasks while the server stays up.

**Background commands:**

If you want Claude to start something and not wait for it to finish, you can ask explicitly:

```
Start the development server in the background
```

Claude will start the process and return control to you, with the server running separately. Press `Ctrl+B` in the terminal to manually background a running command.

---

## Safety: What Claude Will Not Run Without Permission

Claude Code is designed with a conservative approach to running commands. The general rule:

- **Reading commands** (like `ls`, `cat`, `git status`) — Claude can run these more freely because they do not change anything
- **Write or execute commands** (like installing packages, modifying files, running scripts) — Claude will ask permission before each one

Beyond that, certain types of commands are treated with extra caution:

**Sensitive operations:** Commands that could delete data, expose secrets, modify system settings, or make network requests to external services require explicit approval.

**Irreversible operations:** Anything that cannot easily be undone — like deleting files or pushing to a remote server — will prompt for confirmation.

**Commands involving sensitive files:** Claude will not read or pass the contents of `.env` files (which typically contain passwords and API keys) to commands without explicit permission.

You can customize which commands are always allowed or always denied using the permissions system described in Chapter 6. For example, you might always allow `npm run test` so you do not have to confirm every test run.

---

## Running Commands Yourself with `!`

Sometimes you want to run a command yourself without going through Claude. You can do this directly from the Claude Code prompt by starting your input with `!`:

```
! git status
! ls -la
! npm run build
```

The `!` prefix tells Claude Code to run that command directly and add the output to the conversation context. This means Claude can see what happened and you can ask follow-up questions about it:

```
! npm run build
[build output appears]
There were 3 TypeScript errors in the output. Can you help me fix them?
```

This is useful when you know exactly what command you want to run but still want Claude to help you understand or act on the result.

---

## Practical Example: Setting Up a New Project

Here is how command execution flows in a real scenario. Suppose you have just started a new web project and want Claude to help you set it up:

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

Notice how Claude executes multiple commands in sequence, reports what each one did, and checks in with you before proceeding. The whole setup took one message from you and a few seconds of Claude work.

---

## When Commands Go Wrong

Commands fail. This is normal. A dependency might not be available, a port might already be in use, a configuration file might be missing.

When a command fails, Claude reads the error output and usually knows what to do:

```
The npm install failed:
> npm ERR! peer dep missing: react@>=16.8.0

This means the package requires a newer version of React than you have installed.
I can update React first. Would you like me to do that?
```

If Claude's suggested fix does not work, just tell it what happened:

```
That didn't work — I got the same error. Here is the new output: [paste output]
```

Claude will try a different approach. Debugging command failures is a back-and-forth process, and Claude is patient about trying multiple strategies.

---

**Next up:** [Chapter 10 — Git Workflows](./10-git-workflows.md) — Using Claude to commit changes, manage branches, and create pull requests.
