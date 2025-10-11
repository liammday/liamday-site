title: Peaking
type: App build
summary: Daily readiness and periodisation planning for endurance athletes juggling work, family, and racing goals.
role: Product & iOS Developer
year: 2024
order: 7
platforms: iOS, watchOS
status: Prototype in usability testing
stack: SwiftUI, App Intents, HealthKit, Charts
show_store_sections: true
nav:
  - id: overview
    label: Overview
  - id:readiness
    label: Readiness model
  - id:planning
    label: Planning system
  - id:roadmap
    label: Roadmap
stats:
  - label: Feedback cadence
    value: Daily check-ins
    description: Two-question prompts capture subjective load in under 30 seconds.
  - label: Automations
    value: Health sync & widgets
    description: HealthKit recovery signals drive App Intents routines and Lock Screen widgets.
  - label: Target users
    value: Busy amateurs
    description: Designed around athletes balancing training with demanding jobs.
---
## Overview
{: #overview .scroll-mt-32 }

Peaking helps amateur endurance athletes plan smarter training blocks without a personal coach. The app layers a lightweight readiness score on top of structured periodisation templates so the right mix of intensity, skills, and recovery is always clear.

I am using the project to test how App Intents and widgets can keep athletes accountable. Core health metrics such as heart rate variability and sleep are pulled directly from HealthKit while manual check-ins capture context that sensors miss.

## Readiness model
{: #readiness .scroll-mt-32 }

- **Dual data streams**: Objective signals from HealthKit sit alongside qualitative prompts. The model highlights when perceived fatigue diverges from biometric recovery.
- **Actionable insight**: Instead of opaque scores, Peaking presents plain-language guidance—train as planned, adjust duration, or pivot to technique work.
- **Trend visibility**: Weekly retrospectives show how compliance and fatigue evolve, helping athletes and their support network spot overload early.

## Planning system
{: #planning .scroll-mt-32 }

- **Block templates**: Athletes choose from proven 4- and 6-week periodisation templates tailored to triathlon, cycling, or running disciplines.
- **Calendar integrations**: Workouts sync to Apple Calendar and Reminders so training sits alongside career and family commitments.
- **Coach collaboration**: Shared plans allow remote coaches to tweak sessions, drop in notes, and review compliance metrics in real time.

## Roadmap
{: #roadmap .scroll-mt-32 }

1. **Adaptive scheduling** – Auto-adjust sessions based on missed workouts and sleep debt.
2. **Watch-first execution** – Build workout execution on watchOS with haptic cues and spoken instructions.
3. **Team dashboards** – Provide aggregate compliance and recovery views for clubs and corporate wellness cohorts.
