---
app: training
date: 2024-10-30
title: Period goals and a UTC-based date model
summary: Recurring goals and a rebuilt date layer replace ad-hoc DateComponents logic.
anchor: period-goals-utc-dates
---
A PeriodGoal model introduced recurring targets — daily, weekly, monthly —
alongside a matching engine that paired completed workouts against planned
ones, preferring the closest one-to-one fit. The date handling underneath
was rebuilt on UTC with explicit timezone overrides rather than local
DateComponents, after recurring-plan predicates kept producing edge-case
bugs around day boundaries. A basic notification controller landed at the
same time, tied to the count of incomplete plans for the day. The project
then went quiet again for over a year.
