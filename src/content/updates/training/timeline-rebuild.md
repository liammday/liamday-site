---
app: training
date: 2026-01-09
title: The timeline becomes a real List with infinite scroll
summary: Ad-hoc week navigation is replaced by a proper scrolling timeline.
anchor: timeline-rebuild
---
The week-by-week navigation was refactored into a List-based timeline with
drag-and-drop support, inset grouping, and infinite scroll in both
directions. Getting the scroll-to-today anchor right took several follow-up
fixes — the header alignment and initial offset kept drifting — but the
payoff was a timeline that behaved like a real calendar surface instead of
a stack of independently paged weeks.
