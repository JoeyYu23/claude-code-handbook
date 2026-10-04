# The Builder's Job Now

> Written 2026-10-04.

In January 2026, David Heinemeier Hansson wrote that working with autonomous agents felt "more like working on a team" and that he could "review the final outcome, offer guidance when asked." He added a limit: "pure vibe coding remains an aspirational dream for professional work for me, for now." By late September, Gergely Orosz reported that in his Rails World keynote Hansson "declared the end for writing code by hand for professional work – at 37signals at least." Boris Cherny, who leads Claude Code at Anthropic, had told Platformer in May that he had not written a line of code in more than six months. Thorsten Ball, of the Amp coding agent, wrote in September that "the craft of writing code will disappear."

Those are strong claims, and they come from people who build or sell these tools, or who run companies betting on them. Still, they point at a question every chapter of this book has been circling: if typing code is no longer the main job, what is?

This essay collects what careful practitioners are saying about that, where they agree, where they disagree, and what we do not yet know.

## Where the optimists and the skeptics meet

Ball's list of predictions is the boldest. Among them: "Code review will die. I mean: it's already dead." "Unit tests might die too. Why have training wheels if you never fall over?" "There's no proof that 'good code' will matter in the future." And: "The triad of PM/Design/Eng will disappear."

Others push back on parts of this. Addy Osmani argues that tests matter more, not less: "Tests as an independent check on an author you don't fully trust will be the most valuable code you own." Simon Willison, describing what the strongest current models can do, sets a condition. If you can "clearly define the goal for what you want to build, and provide unambiguous instructions about the constraints around that goal," they will solve the problem "through brute force." He then points out that defining goals, writing unambiguous instructions and choosing the right tools "is kind of what software engineering *is*. It takes a lot of experience and skill to do this well."

Read side by side, these writers disagree about how fast things move and about which artifacts survive. They agree on the direction. The scarce work moves from producing code to deciding what to build and judging whether it was built right. Ball says it himself: "The craft of building software will be more important than ever."

## What humans still own

Osmani's August 2026 essay, "Human judgment doesn't leave the software factory. It relocates," gives the clearest list we have found. Someone still:

1. chooses the problem,
2. chooses the architecture,
3. sets the quality bar,
4. decides which verification signals deserve trust, and
5. decides when the evidence is sufficient to ship.

He adds one more line that is easy to skip: "A human still has to own what code ultimately ships."

Each item on that list maps to work this book has described. Choosing the problem and setting the bar is the spec and the "done when" line in [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals). Choosing which signals to trust is the harness, the checks and the eval sets in [Harness Engineering](/en/book3-architect/01-harness-engineering). Deciding when evidence is enough is the risk tiers in [Team Workflows](/en/book3-architect/12-team-workflows). Setting limits on what an agent can touch, and what it can spend, is [Containment and Security](/en/book3-architect/09-containment-and-security) and [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured). None of these are new activities. What is new is that they are now most of the job, rather than the overhead around it.

Osmani's most practical warning is about scale: we can fire up dozens or thousands of agents in parallel, but "your own cognitive bandwidth does not scale in the same way." Running more agents does not give us more attention. The best setups, he argues, will not be the ones that remove humans most completely, but the ones that "place" human involvement most intelligently.

## "Builder"

Cherny has suggested the job title itself may change. "Call it a builder, call it an engineer, call it a product manager — I don't know what the title is, but the role is changing." His reasoning is about what engineers did all along: "It used to be that maybe 50% of my day was actually typing code, and the other 50% was talking to users, brainstorming and coming up with ideas, debugging, thinking through how something works, planning." When he says coding is solved, he adds, he means "for the kind of coding I do — and coding is a small subset of what engineers do."

Geoffrey Huntley takes the organizational side. "The craft has been commoditized," he writes, "but access to do the craft within corporate has not." Processes like Agile, in his reading, "assumed writing software was the costly, scarce activity" and were built around a few people who were allowed to author code. If designers, product managers and analysts can now ship working software, the question becomes who is allowed to, and with which checks.

There is a less comfortable side to the same shift. Ball predicts that "some people will be priced out of producing software." When the work is done by tokens, the cost of tokens decides who gets to build. That is one more reason to measure cost as carefully as quality.

## Readable, or explainable

If nobody reads every line, what does "understanding the code" mean? Huntley's answer: "Software doesn't need to be readable by a human. It needs to be explainable to a human." The human asks the model to explain an artifact and checks that the explanation is correct. He also argues for languages whose compilers "do the verification for you" (he names typed languages such as Rust and Haskell), because compiler errors give the agent back pressure it corrects on its own.

Osmani sets a similar bar from the reviewer's side: "You don't need to have read every line, but you should be able to explain what the change does." Both versions move the test from "did a human read it" to "can a human account for it."

That shift has a weakness we should name. An explanation generated by the same kind of model that wrote the code can be fluent and wrong. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers how correlated model errors are. An explanation is worth something only when someone checks it against the world: a test that fails without the change, a log line, a reproduction. That checking still takes skill, which leads to the hardest problem in this essay.

## Skill decay

Verification needs expertise, and delegating the work can erode it. Anthropic published a randomized study in January 2026: 52 mostly junior engineers learned an unfamiliar Python library, Trio, with or without an AI assistant. The AI group finished slightly faster, but the difference was not statistically significant. On a follow-up quiz, they averaged 50% against 67% for those who worked by hand. The largest gap was on debugging questions, the skill a reviewer needs most. The study also found a pattern within the AI group: participants who asked conceptual questions and follow-ups did better than those who used the assistant only to generate code.

Osmani's "Agentic Skill Decay" draws the lesson: "When a task is finished, it doesn't necessarily mean that you have learned something." Agents skip the struggle that used to build expertise, "so building your reps has to be deliberate." He also explains why this matters beyond any one person's career: "verification is the floor and imagination is the ceiling," and "you can only prompt what you can imagine." A builder who can no longer tell good work from bad cannot set the quality bar, and one who no longer knows what is possible will not ask for it. His suggested practices are modest and concrete: form a hypothesis before prompting, ask the agent to explain rather than just produce, predict how a change might fail before reading its output, solve small problems by hand now and then, and write down lessons so the next session starts from them.

We should be careful not to over-read one study of 52 people learning one library. It does not show that experienced engineers lose skills they already have, and it measured learning over a short session, not over a career. But it is the best controlled evidence we have, and it points the same way as practitioners' reports.

## The overhang

Ethan Mollick offers a different frame. His September 2026 essay, "The Overhang," argues that the binding constraint is no longer what models can do. It is "the gap between what these models can do and what almost anyone is doing with them." That gap is an opportunity, he says, "because most people don't bring their own advantages to AI, and those who do get much more out of it."

He names four such advantages: deep knowledge of a field, wide knowledge across fields, taste, and agency. Taste is the one that best describes the builder's new job: "Now making is fast and cheap. The scarce resource is your ability to select among stuff using your own taste." Agency, in his sense, is "a willingness to test the boundaries of what's possible when everybody is equally confused about what AI can do."

Read with the skill-decay evidence, Mollick's frame says that the advantages that matter most are the ones that delegation can wear down. Deep knowledge comes from doing the reps. Taste comes from having made and judged many things. They do not keep themselves up.

## What we do not know

Most of what is quoted here is prediction or opinion from people close to the tools. Cherny leads the product this book is about. Ball works on a competing agent. Hansson runs a company that has bet its workflow on agents. Their observations are valuable, and their stakes are real. The controlled evidence is thin: one small study on skill formation, a handful of company reports, and a growing number of benchmarks that measure tasks, not careers.

Ball himself adds the most useful caution in his own list: "It'll take a while for this to play out. It'll take a generation for the 'new software' to replace the 'old software'." Much of the software we maintain was written by people, for people to read, and will be around for a long time.

The honest position is to hold these predictions loosely and to measure our own work. Do our checks catch what breaks? Do we still understand the systems we are accountable for? Are we spending tokens where they pay? This book has tried to give you the tools to answer those questions for yourself.

## A working definition

If we had to write the job description today, it would read something like this:

- **Choose the problem.** Decide what is worth building and for whom.
- **Define done.** Write the goal, the constraints and a check an agent can run.
- **Own the harness.** Instructions, skills, tools, permissions and budgets are your code now.
- **Verify.** Trust signals you have tested, not claims, and look hardest where the blast radius is largest.
- **Decide to ship,** and be the person accountable when it breaks.
- **Stay capable of all of the above.** Keep enough hands-on skill to judge the work, on purpose, because the workflow will not do it for you.

Whether we call that person an engineer or a builder matters less than whether someone on the team can still do every item on the list.

## Sources

- David Heinemeier Hansson, "Promoting AI agents", 2026-01-07. https://world.hey.com/dhh/promoting-ai-agents-3ee04945
- David Heinemeier Hansson, "Endless execution", 2026-08-09. https://world.hey.com/dhh/endless-execution-4157e065
- Gergely Orosz, "The Pulse: RoR creator sparks new 'death of coding by hand' debate", The Pragmatic Engineer, 2026-09-24 (paywalled; free preview only). https://newsletter.pragmaticengineer.com/p/the-pulse-end-of-coding-by-hand
- Casey Newton, interview with Boris Cherny, Platformer, 2026-05-26. https://www.platformer.news/boris-cherny-interview-ai-jobs/
- Thorsten Ball, "What I believe about the future of software development", 2026-09-19. https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/
- Simon Willison, "2026 in LLMs (so far)", 2026-09-27. https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/
- Addy Osmani, "Human judgment doesn't leave the software factory. It relocates.", 2026-08-21. https://addyo.substack.com/p/human-judgment-doesnt-leave-the-software
- Addy Osmani, "Mastery Still Comes From Doing the Reps" ("Agentic Skill Decay"), 2026-08-31. https://addyo.substack.com/p/agentic-skill-decay
- Addy Osmani, "The Code Nobody Reads", 2026-09-28. https://addyo.substack.com/p/the-code-nobody-reads
- Geoffrey Huntley, "software doesn't need to be readable anymore. it needs to be explainable.", 2026-10-02. https://ghuntley.com/readable/
- Geoffrey Huntley, "the craft has been commoditized, but access has not", 2026-10-02. https://ghuntley.com/access/
- Judy Hanwen Shen and Alex Tamkin, "How AI assistance impacts the formation of coding skills", Anthropic, 2026-01-29. https://www.anthropic.com/research/AI-assistance-coding-skills
- Ethan Mollick, "The Overhang", One Useful Thing, 2026-09-18. https://www.oneusefulthing.org/p/the-overhang
