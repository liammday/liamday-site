---
app: rallying
date: 2025-05-16
title: HealthKit workout sessions and a heart-rate chart
summary: Playing a match becomes a tracked workout, with heart rate charted alongside the score.
anchor: healthkit-workout-capture
---
A workout session tracker was added so that scoring a match on the watch
also recorded it as an Apple Health workout, complete with heart rate and
active energy. It shipped rough in March — the first version was described
in its own commit message as "working but buggy" — and ending a workout
cleanly was hardened over the following weeks: async session handling,
nil-safety checks, and, by mid-May, a confirmation step to stop a workout
being ended by accident. A heart-rate chart on the match detail view,
hidden automatically for imported matches without timing data, was the
payoff for getting the session lifecycle right.
