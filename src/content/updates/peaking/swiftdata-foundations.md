---
app: peaking
date: 2024-03-01
title: SwiftData models and a summit record
summary: The idea gets a data model — peaks, summits, and a real onboarding flow.
anchor: swiftdata-foundations
---
After a long quiet stretch the project resumed with a proper data layer:
SwiftData models for summits, a create/delete flow for logging one, and an
onboarding sequence that decoded a bundled peak list from JSON. Filtering by
elevation and cross-checking against Strava downloads showed up early,
establishing the core idea that a summit should be checkable against
something external rather than just ticked by hand. The navigation was still
a single list; tabs and a proper map came later.
