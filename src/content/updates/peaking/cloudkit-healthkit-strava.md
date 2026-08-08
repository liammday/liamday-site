---
app: peaking
date: 2025-08-01
title: CloudKit sync, HealthKit and Strava route matching
summary: Route-based summit verification arrives, backed by CloudKit and an offline tile cache.
anchor: cloudkit-healthkit-strava
---
Collections (the app's name for hiking lists such as the Munros) were
generalised across element types, and models were adjusted ahead of
CloudKit compliance so a user's summits could sync across devices. This is
when the verification idea from day one finally landed in code: a route
summit search actor checked HealthKit workouts and, shortly after, Strava
activities against nearby peaks to confirm a summit from the GPS track
rather than a manual tap. A tile cache with a quick-load-then-refresh
pattern kept the map usable offline, which set the pattern the app has
followed ever since — local-first, sync second.
