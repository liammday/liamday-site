---
app: rallying
date: 2025-04-24
title: One shared codebase for watch and phone, then a production CloudKit rebuild
summary: The standalone watch app is folded into a companion app, and CloudKit sync is rebuilt to survive production.
anchor: shared-views-refactor
---
After a failed attempt to archive the watch app as a standalone target, it
was refactored into a proper companion app sharing views, models and a
CloudKit container with the phone. That unlocked the first TestFlight
build, but CloudKit sync then had to be rebuilt to work reliably in the
production container rather than only in development — a gap that a
string of "bug fixes to matches" and "rebuilds to get cloudkit sync to
work" commits worked through over the following two weeks, alongside
player statistics that could now finally account for drawn matches.
