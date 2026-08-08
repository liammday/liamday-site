---
app: claude-usage-pacer
date: 2026-07-14
title: A second provider, and the panel that lied
summary: The pacer now watches Antigravity's budgets alongside Anthropic's. Adding them caught a panel that had reported zero usage for three days, and a projection confident enough to name a run-out day on six percent of a week's evidence.
anchor: second-provider-and-the-panel-that-lied
---
The tool had a Gemini panel for three days. It never once told the truth.

Across 4,271 recorded readings it said the same thing every time: every
budget full, nothing used. The cause was not a broken request. It was a
request that worked perfectly, against the wrong thing. The collector
authenticated as the Gemini command line tool while the actual work was
happening in Antigravity, and Google's backend resolves quota per client
identity. The token was faithfully reporting the untouched buckets belonging
to a tool I was not using. A monitor returning a real number about the wrong
subject is the same failure the dead predecessor taught me to fear, wearing a
better disguise.

The fix was to ask as Antigravity rather than as the command line tool. It
meters four budgets: a Gemini pool and a Claude and GPT pool, each with a
rolling five-hour window and a weekly one. The first honest reading was not
comfortable. The Claude and GPT pool was sixty-eight percent through its
week, one day into it.

<figure class="not-prose my-8">
<img src="/assets/images/projects/claude-usage-pacer-antigravity.png" alt="The Usage Pacer popover watching two providers: a shared seven-day burn-up chart with a line for Claude, Gemini and Claude and GPT, each against its own working-hours pace curve, with Claude reading too early to project and the two Antigravity budgets projected to run out on Thursday and Wednesday; below it, an identical section for each provider showing its five-hour tracker." width="1296" height="1896" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20" />
<figcaption class="mt-3 text-xs text-aluminum-400">Three budgets, one chart. Colour says which provider, line style says which quantity: solid for what was spent, dashed for the pace it must hold, dotted for where it lands. Claude declines to guess. The other two are already projected to run out days before they reset.</figcaption>
</figure>

Then came the reframe. I had built the shared view around a distinction that
turned out to be false: Claude is a budget you have paid for and want to
fill, Antigravity is a cap you must not hit, so the same rising line meant
opposite things and the chart needed a warning label to explain itself. That
is wrong. Both are budgets you have paid for that reset on a clock, and for
both the aim is to land near a hundred percent exactly as they reset. Running
out of Antigravity on Wednesday is the same failure as running out of Claude
on Wednesday. That reframe matters, because it collapsed three chart
implementations into one. There is now a single chart in the app, drawn three
times.

The harder question was the prediction line. Claude had one and Gemini
appeared not to, and the reason was worse than a missing feature. They were
projected by two different functions that disagreed. Claude extrapolated its
rate in wall-clock time, so its chart shaded my working hours, bent the pace
line around them, and then drew a projection straight through the night as if
quota were burnt while asleep.

Unifying them surfaced the real bug. A rate taken over a sliver of elapsed
time is division by nearly nothing. Seven percent spent against six percent
due reads as "you will land at a hundred and seventeen, and run out on
Thursday" for someone fourteen hours into a seven-day week. The engine had
been doing exactly this all along and I had never looked: it reports a
hundred and thirty two percent landing for a user sitting at seven percent,
while calling that same user behind in the same breath. Carried into the
chart it flipped the status to over, and would have told me to ease off with
six days and ninety three percent of the week still in hand.

So the tool now refuses. No projection until a working day of the window has
actually passed, and where the line would have been it says "too early to
project" rather than a number. That is the founding rule applied to a place I
had not thought to apply it: show nothing rather than something false. A
figure Google omits is reported as "no data" for the same reason, and never
quietly defaulted to full, which is the trap that would have hidden the
original lie for another three days.

One number to close on. The collector had been polling Google about fourteen
hundred times a day. It now holds a staleness gate that tightens when a budget
is nearly spent, and makes roughly three hundred calls instead. The tool
became more honest and less rude in the same week.
