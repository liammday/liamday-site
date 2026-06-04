---
title: PodForge
description: An applied-AI case study on PodForge, a self-hosted, multi-feed podcast generator where Claude writes the script, a Mac renders it to audio with a local text-to-speech model, and a Raspberry Pi publishes the RSS. It runs at no marginal cost, keeps a measured calibration loop instead of a guessed speaking rate, and treats the hosts as fictional characters by design.
summary: A self-hosted podcast pipeline that turns a topic into a finished, published episode. Claude writes the transcript to a per-feed brief; a Mac service renders it with a local Kokoro voice, mixes jingles and sound effects and normalises loudness; a Raspberry Pi writes the MP3 and rebuilds the feed. One command wraps the whole run, it is also exposed as an MCP server, and a calibration loop keeps episode lengths honest.
role: Architect and engineer (AI-paired)
year: 2026
client: Personal applied-AI build
outcome: Live, multi-feed, self-hosted
order: 3
type: Case study
image: /assets/images/projects/podforge-og-card.png
hero_image: /assets/images/projects/podforge-hero.svg
hero_image_width: 1600
hero_image_height: 800
hero_image_alt: "PodForge mark: a glowing forge core on the left renders a script into an ember audio waveform, which fans out into concentric broadcast arcs with one episode lit and ringed."
nav:
  - id: lede
    label: What it does
  - id: problem
    label: The problem
  - id: overview
    label: Architecture
  - id: control
    label: Control where it counts
  - id: decision
    label: A decision the build made
  - id: guardrails
    label: Honest by design
  - id: open
    label: Open work
links:
  - title: "Sibling build: LifeOS, a personal Claude-and-MCP system"
    url: https://www.liamday.co.uk/projects/lifeos/
  - title: "Sibling build: open-defence-radar, grounded retrieval over open data"
    url: https://www.liamday.co.uk/projects/open-defence-radar/
---

## What it does
{: #lede .scroll-mt-32 }

PodForge turns a topic into a finished, published podcast episode, without a studio, a microphone, or a cloud bill.

You give it a subject, a document, or just the thread of a conversation. Claude writes a real transcript to the brief of whichever feed you are publishing to. A service on my Mac renders that script to audio with a local text-to-speech voice, mixes in the intro jingle and any sound effects, and normalises the loudness so every episode lands at the same level. A Raspberry Pi then writes the MP3 and rebuilds the RSS feed, and the episode appears in an ordinary podcast app a few seconds later.

The whole run sits behind one command, `podcast publish`. That same toolchain is also exposed as an MCP server, so I can drive it straight from a conversation: write the script here, render and publish there, report the duration and the feed URL back.

<figure class="not-prose my-10">
{% include podforge-output.svg %}
<figcaption class="mt-3 text-xs text-aluminum-400">Example output: a published episode of "The Big Why" on the children's feed. The audio is rendered on-device with local voices, the mix carries an intro jingle and sound effects played in the gaps, and the script was written to a calibrated length target rather than a guessed one. The Pi rebuilds the feed and the episode is delivered through a signed URL.</figcaption>
</figure>

It is genuinely multi-feed. The same engine runs a focused, two-host study feed for my MBA revision and a gentler, more wondering children's feed for my eight-year-old, each with its own cast, tone, jingles and rules. Adding another feed is one command and a small config file.

## The problem
{: #problem .scroll-mt-32 }

I wanted my own podcasts, on my own terms, for an audience of two.

One of them is me. I am working through an MBA, and the most useful thing I can do with a dense week of course material is turn it into something I can listen to on a walk: a focused, two-host episode that holds the argument together rather than reading a summary at me. The other is my eight-year-old son, who asks the kind of relentless, wonderful, gloriously silly questions a curious child asks — why is the sky blue, where does the sea end — and deserves a show that takes them seriously, in a voice and a world built for him.

The closest off-the-shelf answer is Google's NotebookLM: hand it your sources, get back an AI "audio overview". It is genuinely clever. But it writes the show its way, picks the voices, and keeps the result inside someone else's web app; and the moment you want natural-sounding speech of your own, you are renting a hosted text-to-speech voice — an ElevenLabs subscription, or one like it — on top of a hosting bill. The writing lives in their product rather than in a conversation, the voices and the content sit on their servers, and the marginal cost of one more episode is a line on an invoice.

For something this personal and this small, that is the wrong shape. The marginal cost of one more episode should be close to nothing. The content should stay on hardware I own. And the interesting part, the writing, should sit where the writing is best done, in a conversation with Claude, not bolted onto a generic generator that turns any pasted text into the same flat read.

The children's feed carries a second motive worth naming. He already has a Toniebox — the lovely, screen-free audio box where a figurine plays a fixed, bought-in story. PodForge's children's feed is the personalised counterpart to it: the episodes answer his questions, not a stranger's, and because each feed is just ordinary podcast RSS, the show lands inside the Apple ecosystem he already lives in, where Screen Time and parental controls apply natively. A bedtime show written for him, that the platform's own guardrails already police.

So the build question was narrow. Could I make a pipeline that writes a genuinely good script to a specific show's brief, renders it to natural audio locally, publishes a real RSS feed I can subscribe to in any app, and costs nothing per episode to run. PodForge is that pipeline — in effect a Claude-first alternative to NotebookLM, with no hosted-voice subscription behind it — built end to end, with the awkward parts of audio left in rather than smoothed over.

## Architecture
{: #overview .scroll-mt-32 }

<figure class="not-prose my-10">
{% include podforge-architecture.svg %}
<figcaption class="mt-3 text-xs text-aluminum-400">One path from a topic to a published feed. Claude writes the transcript to the per-feed config; the Mac service renders, mixes and normalises with a local model; the Pi writes the MP3 and rebuilds the feed.xml; delivery is a Cloudflare Tunnel with admin access and signed URLs for listeners. A single CLI, also an MCP server, wraps render and publish, and the measured duration feeds back into the next script's length target.</figcaption>
</figure>

The shape is a clean split between the part that should reason and the parts that should be deterministic.

The writing is reasoning, and it sits with Claude, guided by a Skill. The Skill is instructions, not code: it loads the target feed's configuration and its running feedback log, applies the tone profile and the cast, structures any named segments, and writes the script. It treats the most recent feedback on a feed as an instruction rather than a suggestion, which is how a show develops a voice over a run of episodes.

Everything after the script is machinery. The Mac runs a small local service as a background agent. It renders the transcript with Kokoro, a text-to-speech model that runs on the Apple Silicon GPU at roughly real time or faster, so a ten-minute episode renders in about a minute and a half and never leaves the machine. It then mixes any sound effects, wraps the intro and outro jingles, and normalises the loudness. The finished MP3 is handed to a service on the Raspberry Pi, which stores it and rebuilds the RSS for that feed. Delivery runs over a Cloudflare Tunnel: the admin surface sits behind Access, and each listener gets their own signed URL, so a feed can be shared with one person without being public.

A measured calibration file closes the loop. Rather than assume a fixed words-per-minute rate, the system records the real rendered duration of every episode and uses it to set the word-count target for the next one, per feed, so the length estimate sharpens with use.

## Control where it counts
{: #control .scroll-mt-32 }

The difference between a text reader and a listenable podcast is in the details of the speech, so the script carries a small set of controls that the renderer honours.

Pronunciation is handled, not hoped for. Acronyms and proper nouns that a model tends to mangle are wrapped with a phonetic override that forces the right reading on every occurrence, drawn from a dictionary that grows whenever the voice reveals a new mispronunciation. The script can also place a deliberate pause to land a point, slow a span it wants the listener to sit with, and tag a sound effect that the renderer resolves to real audio at build time. Those effects are placed to play in the gaps between lines rather than under the voice, so they add texture without fighting the words.

The unglamorous rules matter just as much. The dialogue is kept free of any markup, because the voice would read the symbols out loud. When an episode title promises a number of facts, the script is checked to contain exactly that many. Numbers are made to agree with the things they count. None of this is clever, and all of it is the difference between something you would actually listen to and something you would switch off.

## A decision the build made
{: #decision .scroll-mt-32 }

PodForge began as one thing, a study-podcast tool for revision, with a single feed and a single register. The obvious thing to do with a tool that works is to add features to that one show.

The better decision was to generalise it instead. The study feed and the children's feed want genuinely different things: a different cast, a different pace, different vocabulary, a different attitude to jokes and sound effects, and in the children's case a hard rule that the hosts are fictional characters and no real person is ever impersonated. Rather than fork the tool or pile both shows' needs into one prompt, the build pulled everything show-specific out into a per-feed configuration and a per-feed feedback log, and left the engine generic. Adding a feed is now a command and a small file, and a change to one show cannot leak into another.

That carried a cost worth naming. It meant building a scope discipline that did not exist before: every change now has to be classified as tool-wide or feed-scoped before it is made, because the same code path serves every show. The reward is that the pipeline is no longer a single podcast with my preferences baked in. It is a small podcast platform that happens to run two feeds today and could run ten tomorrow.

The other decision worth stating plainly is the one not to spend money. A hosted voice — the ElevenLabs-style subscription a tool like NotebookLM nudges you towards — would likely be a notch more natural than a local one. But local rendering keeps the marginal cost of an episode at zero, works offline, and keeps every voice and every script on hardware I own, and the calibration loop is exactly the instrument that would tell me whether a paid voice ever earned its place. For a personal tool meant to run for years, that was the right trade, and the architecture is drawn so the voice is a swappable part, not a rewrite.

## Honest by design
{: #guardrails .scroll-mt-32 }

The guardrails are not a note at the end of an episode. They are rules the generator has to respect before anything is rendered.

The hosts are fictional, always. A feed can register a named persona as a character, but the system will not put words in the mouth of a real person the listener knows, and on the children's feed that is a hard rule rather than a preference. The voices are a fixed, registered cast, so an invented guest cannot quietly collide with an existing one. The output is written in British English by default, pitched at the reading level the feed asks for, and a children's episode is held to gentler pacing and simpler analogies than a study one.

For a tool that produces audio for my own family, that posture is the product, not the packaging. The point of owning the whole pipeline is that these rules live in code and config I control, not in the terms of service of a generator I rent.

## Open work
{: #open .scroll-mt-32 }

The honest list of what is not finished.

The calibration loop is good and getting better, but it is still an average rate per feed, not a model of how pacing, jingles and sound effects each bend the final duration. Episodes with heavy effects are the ones it estimates least well, and that is the next thing to sharpen.

Sound-effect sourcing leans on a couple of free libraries and a local cache. It is reliable for common cues and thin for specific ones, and the resolver is built to fall back rather than fail, which is the right behaviour but not yet a rich one.

Artwork is per-feed rather than per-episode, because the publishing host is locked down enough that deploying a new cover for every episode is not yet automated. It is a plumbing problem, not a design one.

PodForge is a deliberately small answer to a question I actually had: can one person run their own podcasts properly, for almost nothing, without handing the writing, the voices or the content to someone else. The answer it argues for is the one I would bring to a larger build. Put the reasoning where reasoning is best done and keep everything else deterministic. Measure the thing you would otherwise guess. Pull what varies out into configuration so the engine stays generic. And own the rules that matter, rather than renting them. The subject here is a family podcast; the discipline travels.
