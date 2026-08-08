---
app: rallying
date: 2025-03-04
title: Rally-by-rally scoring and server tracking
summary: The core mechanic arrives — recording who served, who won the rally, and the score that follows.
anchor: rally-scoring-foundations
---
The data model grew a proper scoring method, with explicit selection of
the first server and the opening server for each match and game, and
server-side tracking that updated automatically as rallies were logged.
Fixing custom-enum handling for CloudKit came early, a reminder that
SwiftData's CloudKit mirroring is stricter about type shape than local
persistence alone. By early March a match could be scored rally by rally
with the correct side and points display, the foundation everything else
was built on.
