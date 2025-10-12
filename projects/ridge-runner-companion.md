---
title: RidgeRunner Companion
type: App build
summary: Building an offline-first hiking companion to test product release rituals and resilient mobile tooling.
role: Product & iOS Developer
year: 2024 – Present
order: 4
platforms: iOS, watchOS
status: Alpha release cadence
stack: SwiftUI, Core Location, MapKit, CloudKit
stats:
  - label: Mission
    value: Safer solo hikes
    description: Deliver rapid readiness cues and actionable journalling for remote terrain.
  - label: Quality practice
    value: Release rituals
    description: Every sprint runs through automated UI tests, smoke walks, and TestFlight notes.
  - label: Offline focus
    value: 100% field-ready
    description: Critical data cached locally with background refresh to keep routes current.
nav:
  - id: overview
    label: Overview
  - id:direction
    label: Product direction
  - id:build-focus
    label: Build focus
---
## Overview
{: #overview .nav-scroll-anchor }

RidgeRunner Companion is my personal test bed for the operational habits I coach in client teams. The iOS app supports solo hikers
with curated route intelligence, dynamic weather readiness cues, and after-action journalling. Each release exercises the
foundations of dependable product delivery—continuous QA, transparent changelogging, and instrumentation that closes the loop
between user signal and roadmap decisions.

## Product direction
{: #direction .nav-scroll-anchor }

- **Audience focus:** Experienced hikers and mountain leaders who need fast, trustworthy guidance in the field.
- **Differentiator:** Layers route cards, weather alerts, and kit checks into a single view that stays useful offline.
- **Commercial intent:** Freemium model with premium packs for advanced mapping overlays and guided itineraries.
- **Success signals:** Activation through saved routes, weekly retention from journal entries, and support demand trending down as
  in-app education matures.

## Build focus
{: #build-focus .nav-scroll-anchor }

Current development sprints explore three core themes:

1. **Offline-first resilience** – background sync tasks keep topo tiles, safety notices, and kit lists current without requiring
   manual refreshes.
2. **Quality loops** – XCTest suites plus TestFlight feedback groups mirror the cross-functional QA rooms I facilitate in client
   organisations.
3. **Insight instrumentation** – privacy-conscious analytics quantify how features land, feeding a public changelog and backlog
   priorities.

The build journal on this page will continue to evolve as I publish release notes and architectural learnings.
