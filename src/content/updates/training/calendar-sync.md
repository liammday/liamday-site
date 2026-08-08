---
app: training
date: 2026-01-04
title: Two-way calendar sync
summary: Planned workouts gain a live link to Calendar, in both directions.
anchor: calendar-sync
---
Work resumed with a run of tightly scoped pull requests building EventKit
integration from the ground up: calendar permissions, recurrence mapping,
all-day event handling, conflict resolution, and a debug menu to inspect
sync state directly. The result let a planned workout create a calendar
event and stay in sync with edits made on either side, including recurring
series and their exceptions — the first of several features built this way,
as a fast sequence of small, reviewable pull requests rather than one large
branch.
