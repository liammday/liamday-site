---
app: podforge
date: 2026-06-18
title: 'A better voice: from a dialogue model to per-speaker cloning'
summary: The local voice was the one part of the pipeline I had left rough. A push to make it more expressive turned into a useful lesson about choosing the right kind of model, and landed on a setup that is both more natural and more consistent than where it started.
anchor: voice-engine-qwen3
---
The case study above describes the renderer as Kokoro, a small, fast,
reliable local voice. It still is the dependable fallback, but the default
has now moved on, and the path there is worth recording because it is a
tidy example of letting evidence, not enthusiasm, choose the tool.

The motivation was expressiveness. Kokoro reads cleanly but a little
flatly, and I wanted the study feed in particular to sound more like a
conversation. The obvious candidate was Dia, an open dialogue model that
generates two speakers in one pass with real warmth and timing. On paper
it was perfect. In practice it had a fault that no amount of tuning fixed:
it re-invents the speaker voices on every generation call, and because a
long episode is rendered as many short calls, the voices drifted from one
passage to the next and the joins between calls were audible. This is not
a quirk of my setup; it is a known, open limitation of the model itself. I
spent a full pass on segmentation, pacing, silence handling and
reference-audio cloning before accepting that the model simply could not
hold a steady voice across a whole episode.

So the first decision was to stop. I reverted the default to Kokoro, which
renders a whole script in a single call and therefore cannot drift or
seam, and wrote the alternatives up properly rather than keep pushing a
tool that was the wrong shape for the job.

The answer turned out to be a different open model, Qwen3-TTS. The key
difference is structural: it renders one fixed voice per turn rather than
improvising a dialogue, so a cloned voice stays identical from the first
line to the last. I clone each feed's existing British voices once into a
small library, and the renderer maps every speaker to their voice from the
same per-feed config the rest of the system already uses. The result is
more natural than Kokoro, perfectly consistent unlike Dia, runs entirely
on the Mac, and renders an episode in well under a minute. It is now the
default for every feed, with Kokoro kept as the reliable fallback and the
voice still a swappable part, exactly as the architecture was drawn to
allow.

The lesson is the one the case study already argues for, sharpened by a
real failure. The expressive-looking tool was not the right tool; the
right tool was the one whose structure matched the constraint, a steady
voice held across many calls. Measuring what you would otherwise guess,
and keeping the voice a swappable part rather than a rewrite, is what made
the change a single afternoon instead of a rebuild.
