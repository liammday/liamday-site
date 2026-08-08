---
app: training
date: 2026-06-30
title: A formal policy for calendar-authored plans
summary: Plans created from calendar events get a defined, migrated representation instead of an implicit one.
anchor: calendar-representation-policy
---
A calendar representation policy was designed and rolled out in phases: a
core sentinel-and-resolve-at-sync mechanic, an automatic migration with an
onboarding and settings guard, and a set of smaller consistency fixes —
honouring rest days, deterministic availability, and copying pins across a
recurring series. The work was paired with a UI and unit testing suite and
an architecture write-up on the timeline's infinite-scroll behaviour,
moving what had been implicit conventions into documented, tested rules.
