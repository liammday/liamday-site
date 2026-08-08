---
app: training
date: 2026-02-17
title: Shortcuts and persistent App Intents
summary: Logging a workout or rest day becomes possible from outside the app entirely.
anchor: app-intents
---
App Intents work that had been scoped out in a planning document landed as
persistent intents for logging workouts and rest days, backed by an App
Group so Shortcuts and the main app shared state. Getting the intents to
compile alongside the rest of the target took a couple of follow-up fixes,
a reminder that App Intents' build-time metadata generation is stricter
about project structure than ordinary SwiftUI code.
