---
app: rallying
date: 2025-10-31
title: CloudKit-backed sync and a settings diagnostics tab
summary: SwiftData containers get real CloudKit mirroring, and sync problems become visible instead of silent.
anchor: cloudkit-identity-rework
---
After a quiet stretch, CloudKit backing was properly enabled for the
SwiftData containers, with diagnostics tools added to a new settings tab
to make sync problems visible rather than silent. That work surfaced a
deeper issue: the app's notion of "the default player" was informal and
prone to duplicating on reinstall — a problem that would take a proper
identity store to fix, which came later as part of the v2 rewrite below.
