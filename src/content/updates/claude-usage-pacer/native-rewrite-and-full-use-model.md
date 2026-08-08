---
app: claude-usage-pacer
date: 2026-07-08
title: The native rewrite, and aiming at the whole budget
summary: The open-work section promised a native rewrite; it is done. The pacer is now a SwiftUI menu bar app with an interactive chart, it writes its own guidance with an on-device model, and the target moved from a fixed reserve to aiming at the whole budget while inferring how much to hold back for the daily routine work.
anchor: native-rewrite-and-full-use-model
---
The write-up ended by naming a native rewrite as open work. That is now the
tool I run. The Python engine that reads the usage API and models the week is
untouched and still does the thinking; what changed is the surface. A SwiftUI
menu bar app reads the same state files and renders them, and it ran in
parallel with the old Python menu bar until it had matched it feature for
feature, at which point the old one was retired. Keeping the proven engine and
rebuilding only the glass was the low-risk path, and it means the data and
pacing layers carried over exactly as the original write-up predicted.

The headline of the new surface is a proper chart rather than a pair of
numbers. Open the menu and the week is a burn-up: actual usage so far, an
ideal pace line weighted to my working hours, my typical week drawn from past
weeks so I can see whether this one is heavier or lighter, and a projection
from the rate so far that runs on to the point it would hit the cap and labels
the day I would run out. Below it a slim five-hour meter shows fullness and
the reset clock, because pace inside a five-hour window is a cap to respect,
not a target to chase.

<figure class="not-prose my-8">
<img src="/assets/images/projects/claude-usage-pacer-popover.png" alt="The Usage Pacer popover: a week-long burn-up chart with the actual usage line, a working-hours pace line, the typical-week average, and a projection that meets a run-out marker on Thursday, above a tapering routine-reserve band; a five-hour fullness meter; rows for the aim, the inferred routine reserve, the run-out day and the plan; and a one-line summary written on-device." width="1296" height="1542" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20" />
<figcaption class="mt-3 text-xs text-aluminum-400">The new popover. The week as a burn-up, actual usage against a working-hours pace line and the typical week, with the projection meeting the day it would run out and the routine reserve tapering to nothing at the reset. The line at the foot is written on the machine itself, by an on-device model.</figcaption>
</figure>

The bigger change is conceptual. The first model aimed at eighty-five percent,
a flat fifteen held back. That was always a rough proxy for the real goal,
which is to use the whole budget while never starving the small automated jobs
that run every day. So the target is now the full hundred, and the reserve is
inferred rather than fixed. The tool separates routine work from attended work
by when it happens, learns roughly how much the daily routine consumes, and
holds back only that much for each day still to come. The reserve shrinks as
the week ends, drawn as a band that tapers to nothing at the reset, and the
warning escalates as usage approaches it. If the current rate would empty the
budget before the week is out, it names the day the routine work would start
being starved.

The line of guidance under the chart is now written on the machine itself.
Instead of a templated sentence, an on-device foundation model takes the whole
picture, usage, pace, the run-out day, the reserve and the five-hour window,
and writes a calm sentence or two: push, hold, or ease off to protect the
routine. It runs locally, so it costs nothing, needs no network, and keeps the
numbers on the device.

Two smaller things are in keeping with the first build. The app builds and
verifies from the command line with no project file, and a headless self-test
renders the label, the chart and the whole popover to images, so a change can
be checked without opening the menu. And a fiddly display bug earned its own
fix: a menu bar sitting over a dark wallpaper reports itself as a light
appearance even while it draws its text white, so the countdowns went dim
until the label was made to read on either background. Small, but the kind of
thing you only catch by looking at the real thing rather than trusting it
looked right.
