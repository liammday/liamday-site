---
title: Squash Tracker
type: App build
summary: Rapid match capture and post-game analysis for competitive squash players training without a dedicated coaching staff.
role: Product & iOS Developer
year: 2024
order: 6
platforms: iOS, watchOS, visionOS (concept)
status: TestFlight preparation
stack: SwiftUI, Core Data, HealthKit, CloudKit
show_store_sections: true
nav:
  - id: overview
    label: Overview
  - id: scoring
    label: Match intelligence
  - id: training
    label: Training loops
  - id: roadmap
    label: Roadmap
stats:
  - label: Objective
    value: Reduce admin to play
    description: Capture a full match summary in under 45 seconds post-game.
  - label: Automation
    value: HealthKit sync
    description: Pulls heart rate and calories from Apple Watch workouts to enrich stats.
  - label: Coaching reach
    value: Club players first
    description: Designed for solo athletes and small training groups without analysts.
---
## Overview
{: #overview .nav-scroll-anchor }

Squash Tracker packages the workflows I use with my own club into a native SwiftUI experience. Players set up fixtures in seconds, tag opponents, and capture scoring momentum without juggling paper scorecards. The app automates the admin that distracts from playing so the post-match review is ready before kit bags are packed.

The build explores how far I can push on-device intelligence without a server. Core Data stores a player’s history locally while CloudKit keeps squads in sync across devices. Each release will add richer opponent profiling and experiment with lightweight coaching prompts.

## Match intelligence
{: #scoring .nav-scroll-anchor }

- **Point-by-point capture**: A watchOS companion lets scorers tap winners and forced errors courtside. The iOS app mirrors live momentum so teammates can follow along.
- **Shot pattern tagging**: Quick gestures log serves, volleys, and back-court rallies. Tags roll up into heatmaps that highlight pressure zones.
- **Auto-generated recaps**: Within 45 seconds of finishing a match, players receive a shareable summary showing run lengths, conversion rate under pressure, and stamina drift from HealthKit.

## Training loops
{: #training .nav-scroll-anchor }

- **Objectives to drills**: Training goals link directly to recorded weaknesses so the next solo or partner drill is preselected.
- **Coach mode**: Shared insights allow mentors to leave timestamped feedback against individual rallies without needing full video footage.
- **Season view**: Aggregate dashboards show form trends, endurance gains, and tactical improvements over a league campaign.

## Roadmap
{: #roadmap .nav-scroll-anchor }

1. **Club ladders** – Launch ranking boards with automatic notifications for challenge matches and expiry timers.
2. **Computer vision ingest** – Experiment with visionOS to translate court-side captures into rally logs.
3. **Video overlays** – Pair Apple Watch timestamps with synced video to highlight winning plays automatically.
