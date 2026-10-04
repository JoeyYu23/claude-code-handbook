# Running Commands

> Verified on 2026-10-04 with Claude Code 2.1.289.

## What the terminal can do

The terminal is a text interface for your computer: instead of clicking icons you type commands. Developers live there because build tools, test runners, package managers and version control all have command-line interfaces, and one command can replace a dozen clicks.

Claude Code can run those commands for you. That turns it from an editor into an assistant that acts: it installs a library, runs your tests, starts a development server, checks the state of your project, and reads what came back.

## How it works

Claude runs commands with its Bash tool (on Windows it can use a PowerShell tool; see below). What happens before a command runs depends on your permission mode. In Manual mode, Claude asks before most commands, and reading-only commands such as `ls` or `git status` run without asking. In auto mode, a separate classifier model reviews actions in the background instead of you. In every mode, you can see the command and its output in your terminal. Nothing runs in a black box. [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) explains the modes.

The important part is the loop: Claude runs a command, reads the output, and decides what to do next. If a command fails, it sees the error and can try something else.

## What to ask for

```text
Install the axios library
```
Claude picks the right command for your project (`npm install`, `pip install`, and so on).

```text
Run the tests and tell me which ones fail
```
```text
Run just the tests in the auth module
```
```text
Build the project and tell me about any errors
```
```text
Start the development server so I can preview my changes
```
```text
What is the git status of this project?
```

You do not need to know the command. Describe the goal and check the command Claude chose.

## Reading output

Claude reads command output and can explain it: "I ran the build and got a lot of warnings. Which ones matter?" Warnings are usually not the same as failures, and Claude can tell you which is which.

## Running commands yourself with `!`

Start a line in the prompt with `!` to run a command directly and add its output to the conversation:

```text
! npm test
```

Claude then responds to the output. In the weekly digest for the week of June 22, 2026, Anthropic noted that shell mode now responds to command output without a second prompt, so `! npm test` gets an explanation right away. That is handy when you know the command but want help interpreting the result.

## Long-running commands and background tasks

Tests may take 30 seconds and a build several minutes. While a command runs you can see its output. Press `Ctrl+C` to interrupt.

For processes that are meant to keep running, like a development server, Claude can run them in the background so you can keep talking. You can ask ("start the dev server in the background") or press `Ctrl+B` to move a running command to the background. If you use tmux, press `Ctrl+B` twice. A command that reaches its time limit is moved to the background rather than stopped (unless it starts with `sleep`).

## Guardrails

Claude Code is conservative by default:

- **Reading** commands can run freely; **writing or executing** commands are what the permission system is for.
- You can pre-approve commands you trust, for example test and lint commands, with `/permissions`, so you are not asked every time.
- Auto mode also blocks risky classes of action, such as destructive git commands you did not ask for, and asks before `rm -rf` on an unresolved variable.
- Deny rules always win, in every mode.

If a command looks destructive (deleting folders, force-pushing, anything touching a database you care about), read it before you let it run, whichever mode you are in.

## A note for Windows users

Claude Code can run commands through a native PowerShell tool instead of Git Bash. Per the tools reference, on Windows with Git Bash installed the tool is on by default for claude.ai and Console accounts, and setting `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` turns it on for Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry sessions (`0` turns it off). Since the week of April 27, 2026, Git for Windows is no longer required, and Claude Code uses PowerShell when Bash is absent. Behavior differs by version and setup, so if something is off on Windows, ask Claude to explain which shell it is using.

## When a command fails

Commands fail all the time: a missing dependency, a port already in use, a file that is not there. Paste the new output back if Claude did not see it, and say what happened:

```text
That did not work. Same error, new output: ...
```

If you have corrected Claude two or three times on the same problem, stop. The Claude Code docs recommend running `/clear` and starting again with a better first prompt that includes what you learned.

### Check that it worked

- For an install: ask Claude to run a command that proves it, such as printing the library's version, or running the project.
- For a build or tests: the output should end with a success line, and the exit status should be 0. Ask: "Show me the last lines of the output and the exit status."
- For a server: open the address it prints (for example `http://localhost:3000`) in your browser.

## Sources

- Anthropic, "Interactive mode" (shell mode, `Ctrl+B` backgrounding), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- Anthropic, "Tools reference" (Bash and PowerShell tools), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/tools-reference
- Anthropic, "Choose a permission mode", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- Anthropic, "What's new" (Weeks 18, 26, 28), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
- Anthropic, "Best practices for Claude Code", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
