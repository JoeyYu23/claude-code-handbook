# Chapter 12: Debugging Like a Pro

## The Thing Nobody Tells You About Bugs

Here is the truth that every experienced developer knows: bugs are not a sign that you are doing something wrong. Bugs are a normal, unavoidable part of building software. Every developer, at every skill level, from beginner to expert, spends a substantial portion of their time debugging.

The difference between a frustrated beginner and a confident developer is not that the developer has fewer bugs. It is that the developer has strategies for finding and fixing them.

Claude Code fundamentally changes what "having a strategy" means. You no longer need to spend hours reading documentation, searching Stack Overflow, and staring at the same line of code. You can describe the problem, paste the error, and work through it with Claude as a partner.

This chapter gives you that playbook.

---

## The Most Important First Step: Paste the Actual Error

When something goes wrong, the most effective thing you can do is paste the exact error message into Claude.

Not: "My code isn't working."
Not: "I'm getting an error."

The actual error, copied directly from your terminal or browser console.

Error messages look scary, but they are actually very information-dense. They tell you exactly what went wrong, in which file, on which line. Claude can read them and immediately pinpoint the problem.

Here is a real example of how this works:

```
Me: I ran my Node.js server and got this error:

TypeError: Cannot read properties of null (reading 'email')
    at getUserEmail (/app/src/users.js:47:18)
    at router.get (/app/src/routes/auth.js:23:24)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)

Claude: This error means the code tried to read the `email` property
from something that is `null` — that is, it expected a user object
but got nothing.

Looking at your files, line 47 of users.js is:
  return user.email;

The function `getUserEmail` is being called with a user ID, but when
it looks up the user in the database, no user with that ID exists —
so `user` comes back as `null`, and trying to read `.email` from null
crashes.

The fix is to add a null check before accessing the property. I'll
add one now:
```

This took about five seconds. Without Claude, this might have taken 20 minutes.

---

## Reading a Stack Trace With Claude's Help

The long list of file paths and line numbers after an error message is called a "stack trace." It is a record of all the function calls that were happening when the crash occurred.

Stack traces are essential for finding where a bug lives, but they are intimidating if you have never read one before. Claude turns them into plain English:

```
Can you walk me through this stack trace and explain what was happening step by step?
```

Claude will read each frame (each line in the stack trace) and explain it:

"At the bottom, `express/lib/router/layer.js` is the Express framework routing a web request. That calls your `auth.js` route handler. That calls your `getUserEmail` function in `users.js`. The crash happened on line 47 of `users.js`."

Once you know what the stack trace is saying, it becomes much easier to understand where to focus your attention.

---

## "Why Isn't This Working?"

Sometimes there is no error message. The code runs without crashing, but the result is wrong. This is often harder to debug than a crash, because at least crashes tell you where they happened.

For these situations, describe exactly what you expected and exactly what happened instead:

```
Me: I have a function that's supposed to sort a list of names
alphabetically, but the output is wrong.

Input: ["Charlie", "Alice", "Bob"]
Expected output: ["Alice", "Bob", "Charlie"]
Actual output: ["Bob", "Alice", "Charlie"]

Here's the function:
[paste the code]

Claude: I see the issue. Your sort function is comparing the names
case-insensitively, which is good, but it's also using the locale
`"en-US"` setting which changes the ordering in subtle ways for
names with similar starting letters.

Actually, looking more carefully, the issue is simpler: you're
calling sort() on the array but not returning the sorted result —
you're returning the original array. Array.sort() sorts in place but
your code has a mistake in how it returns.

Let me show you:
```

Notice that Claude caught an issue different from the one it initially suspected. This is normal in debugging — you often find the real problem is not what you first thought.

---

## Common Debugging Strategies

### Strategy 1: Describe the symptoms precisely

The more precisely you can describe the problem, the better. Compare:

Vague: "The login doesn't work."
Precise: "When I enter a valid email and password and click Login, nothing happens — no error message, no redirect, the button just stays there."

Precise: "Login works with my test account but fails with new accounts I created after yesterday's database migration."

Every piece of precision you add helps Claude narrow down where to look.

### Strategy 2: Tell Claude what you already tried

```
I've already tried:
- Checking that the email and password are correct (they are)
- Looking at the network tab in Chrome DevTools — the request is being sent and returns a 200 response
- Checking the console — no errors

But the redirect still doesn't happen after successful login.
```

This prevents Claude from suggesting things you have already ruled out and helps it jump to less obvious explanations.

### Strategy 3: Ask Claude to add debugging output

When a bug is elusive, adding temporary logging statements can reveal what is happening:

```
Can you add some console.log statements to the login function so I
can see what values are flowing through it? I want to see what
the API response contains and what the code does with it.
```

Claude will add strategic logging, you run the code, read the output, and paste it back:

```
Here's what the logs showed:
[paste log output]
```

Now Claude has the actual runtime values to work with, which often reveals the problem immediately.

### Strategy 4: The rubber duck method, upgraded

There is an old programmer's trick called "rubber duck debugging": explain your code out loud to a rubber duck, and often the act of explaining it reveals the problem. Claude Code is a rubber duck that talks back.

```
I'm going to explain this bug to you, and I want you to ask
clarifying questions if anything I say doesn't make sense.

I have an e-commerce checkout flow. When a user clicks "Confirm Order",
it should save the order to the database, charge their card, and send
a confirmation email. The database save and charge work fine, but the
confirmation email sometimes doesn't get sent...
```

Walking through the problem while Claude asks questions often reveals assumptions you did not know you were making.

---

## When Claude Gets Stuck Debugging

Claude is not infallible. Sometimes it will suggest a fix that does not work. Sometimes it will misread a complex piece of code. Sometimes a bug is deep enough that multiple attempts are needed.

When this happens:

**Tell Claude what happened with its suggestion:**
```
I tried your fix but it didn't work. Now I'm getting a different error:
[new error]
```

**Ask Claude to revisit its assumptions:**
```
Let's take a step back. You've suggested 3 things and none have worked.
What else could be causing this? What are we assuming that might be wrong?
```

**Give Claude more context:**
```
I should mention — this code worked fine until yesterday when I
added the new database caching layer. Could that be related?
```

**Ask Claude to read the relevant files more carefully:**
```
Can you read through the entire auth.js file and tell me if
you notice anything suspicious? The bug might not be in the
specific function we've been looking at.
```

**Try a fresh perspective:**
If you have been going back and forth for a while without progress, sometimes it helps to describe the problem from scratch: "Forget everything we've discussed. Let me describe the problem fresh..."

---

## Using Browser DevTools With Claude's Guidance

If you are building a web application, the browser's Developer Tools (usually opened with F12) are essential for debugging. If you are unfamiliar with them, Claude can guide you:

```
I'm debugging a web page and I'm not sure how to use DevTools.
Can you walk me through how to find error messages in the Console tab?
```

Claude will give you step-by-step instructions for your browser. You can also paste screenshots directly into Claude Code — paste an image of your DevTools output and ask Claude to explain what it shows.

---

## The Debugging Mindset

Debugging is essentially detective work. You have an unexpected outcome (the bug), and you are trying to find the cause. The process is:

1. Observe the symptoms precisely
2. Form a hypothesis about the cause
3. Test the hypothesis
4. Update your hypothesis based on what you find
5. Repeat until solved

Claude Code dramatically speeds up steps 2 and 3 — it can form better hypotheses than most humans based on the same information, and it can implement tests quickly. But the overall structure is the same.

One important thing: do not guess at fixes by randomly changing things. "Maybe if I change this number from 10 to 20 something will fix..." is not debugging, it is random mutation. It might occasionally work, but it builds no understanding and can introduce new bugs.

Instead, always have a reason for the change you are making. Claude helps with this: its suggestions always come with an explanation of why it thinks the fix will work. If you do not understand the explanation, ask. Understanding the fix is almost as important as applying it.

---

**Next up:** [Chapter 13 — Working with APIs](./13-working-with-apis.md) — What APIs are, how to connect to them, and how to build something with one.
