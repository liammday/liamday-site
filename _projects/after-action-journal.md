---
title: After Action Journal
type: App build
summary: Drafting a reflective operations journal that transforms field notes into structured learning loops.
role: Product & iOS Developer
year: 2024
order: 5
platforms: iOS, iPadOS, macOS (Catalyst)
status: Research interviews underway
stack: SwiftUI, Core Data, Charts, CloudKit
stats:
  - label: Target teams
    value: Cross-functional squads
    description: Designed for product, ops, and engineering teams needing faster feedback loops.
  - label: Ritual cadence
    value: Under 10 minutes
    description: Guided templates keep debrief capture lean without losing detail.
  - label: Insight delivery
    value: Automated summaries
    description: Narrative reports and charts land in Slack and email immediately after sessions.
nav:
  - id: overview
    label: Overview
  - id: problem
    label: Problem framing
  - id: roadmap
    label: Roadmap
---
## Overview
{: #overview .nav-scroll-anchor }

After Action Journal is a lightweight SwiftUI app that captures the cadence of military debriefs and reimagines it for product
teams. The concept was born from my experience running post-operation reviews in the British Army and facilitating discovery
retrospectives with cross-functional squads. The goal: make it effortless to log what happened, who was involved, and what we are
changing next.

The build is intentionally transparent—each release will document how the facilitation framework translates into interaction
patterns, notifications, and data models.

## Problem framing
{: #problem .nav-scroll-anchor }

- Leaders struggle to turn free-form notes into decisions people can act on.
- Distributed teams need prompts that nudge them to contribute observations quickly.
- Insights degrade when feedback lives in siloed documents or chat threads.
- Organisations rarely close the loop by tracking which improvement actions actually landed.

After Action Journal structures every entry with a shared vocabulary. Tags connect people, systems, and outcomes so teams can see
where friction clusters. Automatic summaries then surface the most cited risks and wins for weekly planning rituals.

## Roadmap
{: #roadmap .nav-scroll-anchor }

1. **Guided capture templates** – launch flows for mission, sprint, and incident reviews with guard rails for classification and
   follow-up owners.
2. **Action tracking** – sync improvement tasks to project tools through a lightweight API bridge and report on closure rates.
3. **Team analytics** – deliver dashboards that highlight recurring blockers, emerging experts, and training needs.

The roadmap will expand as practitioners pilot the workflow. Expect frequent updates as I prove the model with early adopters.
