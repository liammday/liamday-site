---
app: claude-usage-pacer
date: 2026-06-22
title: Closing the loop when you are locked out
summary: 'Since the write-up, the tool stopped being only a pacer and started handling the moment you actually hit the wall: it now tells you, across your devices, exactly when you can resume, and the menu bar readout was tightened to show both clocks at a glance.'
anchor: lockout-reminders-and-readout
---
The original build was about not under-using the week. The gap it left was
the opposite moment: when a window is genuinely maxed and the only useful
question is "when can I start again". Three changes since launch close that
loop.

The first is calendar reset reminders. From the menu bar I can drop a synced
event, with an alert, at the exact moment the five-hour or weekly window
reopens. Because it lands in an iCloud calendar it rings on the phone, Watch
and Mac, so the reminder reaches me whether or not the laptop is in front of
me. Repeated clicks de-duplicate rather than pile up.

The second makes that automatic. A lockout watcher runs on every cycle, and
when a limit hits its ceiling it creates the reset reminder and sends a
single message telling me when usage resumes, once per cycle so it never
nags, and quiet overnight so it does not wake me. It proved itself the day it
shipped: while I was building it the five-hour window hit 100% for real, and
the watcher fired the calendar reminder and the text on its own, exactly as
intended. The nicest kind of test is the one the world runs for you.

The third is a quieter change to the readout. The menu bar now shows both
clocks side by side: for the five-hour and the weekly limit, a countdown to
reset and the percentage used, with the durations formatted to two units so
they stay compact (5d3h when days out, 3h50m under a day). To save width I
dropped the status dots and colour the text instead, so the five-hour figure
shifts green to amber to red as it fills and the weekly figure carries the
pacing colour. Same information, less furniture.

None of this changed the core. The data layer, the burn-down model and the
honest rule of showing nothing rather than something false are all untouched.
These are the edges: the tool now covers the full arc from using more of the
week to telling me precisely when I am allowed back in, and it does it across
every device without my having to ask.
