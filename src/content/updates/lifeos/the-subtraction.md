---
app: lifeos
date: 2026-08-28
title: 'Five dead transports and the system that deleted itself'
summary: One evening of building an automated capture pipeline killed five transport designs in a row, each by measurement. The fix was not a sixth design. Routine capture went to Siri engaged directly, the mail flag became the queue, and the machinery was stood down the same night with a documented way back.
anchor: subtraction
---
The elected inbox needed one thing built: flag an email anywhere, and it
becomes a queue item the on-device model can propose against. One
evening of building that killed five designs in sequence, and the
autopsy is more useful than most launches.

The unattended Email trigger demands a filter that cannot say "any
email". Shortcuts cannot filter mail on flags at runtime, and reading a
property off a mail entity kills a run silently. A Mac-side sweep of
Mail's own index worked end to end, but chained the phone to the Mac
being awake, the exact dependence the migration existed to remove.
Writing reminders over CalDAV turned out to be closed to everyone, not
just me: upgraded iCloud Reminders left the protocol in 2019. And the
last design, a Raspberry Pi writing elected mail into a dedicated
iCloud calendar, proved its server half live within the hour, then
parked forever at the Mac's door on a single permission that a headless
runner can neither display nor register.

Behind all five corpses sat a decision already made: processing is
attended, because I confirm everything anyway. And if a person is
present at the moment of processing, the platform now ships an attended
agent in Mail's right-click menu. So the fix was subtraction. Siri does
routine capture, engaged directly. The flag itself is the queue: it
syncs on its own, shows on every device, and its badge is the nudge.
Claude keeps the reasoning work, reading and writing the same stores,
and the weekly review now ends by recording what Siri fumbled, so the
bet gets judged on evidence in mid-September rather than on vibes.

The machinery came down the same night: timer disabled, queue calendar
deleted, six shortcuts released, two launch agents removed. Twelve
architecture decision records and a register of platform landmines
remain, which is the part I would defend hardest. The route back, if
the trial says so, is one command. The lesson is the one the case study
was always building towards: the best infrastructure is the kind you
can delete, and the second best is the kind you documented well enough
to delete safely.
