---
app: rallying
date: 2026-05-19
title: CloudKit schema-as-code, and a guarded tokenless CI lint
summary: The CloudKit schema becomes a checked-in file, with a lint that catches drift without needing a live token in CI.
---
CloudKit schema-as-code tooling was onboarded from the sibling apps: the
live schema is exported to a checked-in file, validated locally, and
checked in CI via a lint that is guarded to run without a CloudKit token —
laying the sync foundation a multi-device, eventually multi-sport app
depends on.
