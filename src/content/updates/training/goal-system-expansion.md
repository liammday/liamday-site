---
app: training
date: 2026-02-10
title: Nutrition, body, and sleep join workout goals
summary: The goal system widens well past workouts, and HealthKit querying gets sturdier.
anchor: goal-system-expansion
---
Goal types expanded to cover nutrition targets, body composition (weight,
water, body fat), and sleep, each wired to its own HealthKit statistics
query and category query. This surfaced real HealthKit fragility —
incompatible units, throttled queries, background delivery gaps — so the
cycle also added retry logic, throttling, and diagnostics around historical
statistics refresh. The `aps-environment` and HealthKit background
entitlements were trimmed once the simpler polling approach proved
sufficient.
