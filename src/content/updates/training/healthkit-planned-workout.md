---
app: training
date: 2024-09-05
title: PlannedWorkout, goal types, and HealthKit arrive together
summary: The core mechanic gets its first real data model — a plan, a goal, and a way to check it against Health.
anchor: healthkit-planned-workout
---
Development resumed with tab navigation, a jump-to-date control, and a
proper PlannedWorkout model with a create/edit flow. HealthKit functions
moved into a dedicated controller, and goal types were reworked more than
once — from ad-hoc quantity identifiers to a bespoke goal type that could
infer its own HealthKit quantity when needed. This was the point the app's
central idea took shape in code: a planned session with a target, and a
way to check whether Health agreed it happened.
