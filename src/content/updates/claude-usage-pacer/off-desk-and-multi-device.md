---
app: claude-usage-pacer
date: 2026-08-29
title: Off the desk, and onto every screen
summary: The pacer was only ever useful while sat at the Mac that ran it. It is now one app across macOS, iPhone and iPad with Home and Lock Screen widgets, reading the same engine through a Raspberry Pi and an authenticated tunnel, so the read travels with me instead of staying on the desk.
anchor: off-desk-and-multi-device
---
The pacer had a shape problem rather than a feature problem. The engine reads
the usage API, models the week and writes its state to disk, and the menu bar
app renders that state. Both halves lived on one Mac, which meant the only
place I could see whether I was ahead or behind was the machine I was already
sitting at. The moment I stood up, the number I was pacing against went away.

Three changes fix that, and none of them touched the pacing model.

The Mac that runs the engine now publishes its state to the Raspberry Pi at
the end of every cycle, and the Pi serves it read-only over the local network,
behind a bearer token. That is a deliberate split of jobs. The engine still has
to run where the Claude credential lives; the Pi is already on all the time and
is a much better thing to point four devices at than a laptop with a lid.

Serving it beyond the house needed a second layer, because a token on the
origin is the wrong place to stop unwanted traffic. The Pi already runs a
Cloudflare Tunnel for other things, so the snapshot got its own hostname on it,
fronted by a Zero Trust policy that only accepts one service token. Requests
without it are refused at the edge and never reach the Pi at all; the origin's
own token then still has to be right. On the home network I can point the app
at the Pi directly and skip the round trip.

The surface is now one app rather than three. macOS, iPhone and iPad build from
a single target, and a WidgetKit extension gives Home Screen and Lock Screen
widgets showing each budget's percentage, how it is standing against pace and
the time to reset, with the same one-line verdict the popover carries. The
menu bar app on the Mac is the same code with the same shared core. That
matters more than it sounds: the summary sentence, the burn-up chart and the
per-provider sections are computed once, so a phone and a menu bar cannot
quietly disagree about how the week is going.

<figure class="not-prose my-8">
<img src="/assets/images/projects/claude-usage-pacer-ios.png" alt="The Usage Pacer iOS app: a This week block with a row per provider showing percentage used, standing and time to reset, a one-sentence verdict, a seven-day burn-up chart plotting used, pace and landing lines for three budgets, and collapsible five-hour meters for Claude, Gemini and the third-party pool." width="1206" height="2622" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20" />
<figcaption class="mt-3 text-xs text-aluminum-400">The same read on the phone: three budgets, where each stands against its pace, and the day the weekly one runs out at the current rate. The engine still runs on the Mac; this is reading it through the Pi.</figcaption>
</figure>

Credentials were the last piece of friction. The host address, the origin token
and the service token now live in one iCloud Keychain item shared by the app
and its widgets, so they are entered once on one device and every other device
picks them up. Distribution went the same way: an internal TestFlight build for
both platforms, uploaded straight from the command line with an App Store
Connect API key, rather than a development build I have to reinstall by cable.

The failure states got the same treatment as everything else in this tool. A
wrong origin token says the snapshot host rejected the token; a missing service
token says Cloudflare Access rejected it; an unreachable host says so plainly.
The one thing the app will not do is show a stale number as though it were
current, which is the fault that started this project in the first place.
