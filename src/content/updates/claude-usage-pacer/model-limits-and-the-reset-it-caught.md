---
app: claude-usage-pacer
date: 2026-07-09
title: Every limit, and the reset it caught
summary: Anthropic meters more than one weekly limit and occasionally resets usage mid-cycle after an incident. The tool now reads every bucket, and when a reset landed this week it caught it, named the likely cause from the status page, and corrected its own advice.
anchor: model-limits-and-the-reset-it-caught
---
<figure class="not-prose my-8">
<img src="/assets/images/projects/claude-usage-pacer-reset.png" alt="The pacer after an out-of-band reset: usage drops to almost nothing at a blue reset marker on Thursday, the header reads room to push, a Reset row shows 73% to 0% with the cause Elevated errors for Claude Opus 4.8 linked, the model-scoped Fable limit sits below the plan, and the summary advises pushing to use more." width="1296" height="1758" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20" />
<figcaption class="mt-3 text-xs text-aluminum-400">The tool after Anthropic reset the week mid-cycle. Usage drops to nothing at the marked reset, the cause is pulled from Anthropic's status page and linked, the model-scoped Fable limit sits alongside the all-models one, and the read corrects itself to push rather than ease off.</figcaption>
</figure>

The usage API does not report one weekly number, it reports several. There is
the all-models cap, and a model-scoped sub-limit whose model rotates as
Anthropic points it around: it was Sonnet, and this week it is Fable. The tool
reads all of them dynamically now and gives each its own line, so a sub-limit
quietly filling up is visible even while the headline cap still has room, and
it keeps up on its own when the scoped model changes underneath it.

The bigger addition is for a habit of Anthropic's. They periodically reset
weekly usage in the middle of a cycle, usually after an incident, and this
week they did. My weekly usage fell from seventy-three percent to zero on a
Thursday evening, nowhere near the scheduled Tuesday reset. The tool treats
that for what it is, an anomalous drop that is not the weekly reset, marks it
on the chart with its own line, and logs it. It also re-anchors the pacing to
the reset, so the projection measures my rate from the fresh start rather than
being dragged down by usage that no longer counts.

A reset with no explanation is just a mystery you have to go and solve. So when
the tool records one it checks Anthropic's own status page, and if an incident
lines up in time it attaches the likely cause with a link. This one it
labelled "Elevated errors for Claude Opus 4.8", pulled straight from their
status feed. When a fresh reset lands it also notifies me, with the before and
after and the cause, so the first I know of it is a plain explanation rather
than a gauge that has mysteriously emptied.

There was a sting in the tail. In the hour after the reset the on-device
summary got it backwards. On barely any fresh data it told me to ease off when
the honest read was the opposite, that I was well behind and should push, and
it even invented a run-out day that appeared nowhere in the numbers. It was the
same short-history trap the very first build had already learned to distrust,
sprung this time by a reset rather than a cold start, so the projection now
waits for a few hours of real post-reset data before it will speak. But the
deeper fix was not a bigger model. It was to stop asking the small one to
reason over the figures at all. The code decides the recommendation from the
pacing state, and the model's only job is to phrase it in a sentence. That is
the same rule the rest of the tool already lives by: do the honest calculation,
then let the words describe it, never invent it. A monitor that would rather
show nothing than something false has to hold its language to the same standard.
