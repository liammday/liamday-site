---
title: TrainingPlus
type: App build
summary: A companion for Swift and SwiftUI learners that blends spaced repetition, coding challenges, and portfolio-ready mini projects.
role: Product & iOS Developer
year: 2024
order: 8
platforms: iOS, iPadOS, macOS (Catalyst)
status: Content design in progress
stack: SwiftUI, Combine, TipKit, CloudKit
show_store_sections: true
nav:
  - id: overview
    label: Overview
  - id:learning
    label: Learning experience
  - id:content
    label: Content pipeline
  - id:roadmap
    label: Roadmap
stats:
  - label: Curriculum
    value: 40+ micro-lessons
    description: Each anchored to a runnable Swift package with review prompts.
  - label: Practice engine
    value: Adaptive repetition
    description: TipKit nudges learners back to topics when recall starts to fade.
  - label: Community
    value: Portfolio ready
    description: Learners ship shareable mini projects with every module.
---
## Overview
{: #overview .nav-scroll-anchor }

TrainingPlus exists to help self-taught developers turn scattered tutorials into a deliberate practice routine. The app orchestrates learning loops so every topic moves from passive reading to applied builds and peer review.

Learners progress through micro-lessons on Swift fundamentals, SwiftUI patterns, and Apple platform APIs. Each module unlocks a focused coding challenge, discussion prompt, and optional stretch goal. CloudKit sync keeps progress consistent across iPhone, iPad, and Mac.

## Learning experience
{: #learning .nav-scroll-anchor }

- **Guided sprints**: Modules are grouped into weekly sprints with clear objectives, estimated effort, and reflection prompts.
- **Adaptive review**: A spaced repetition engine surfaces flashcards and quiz questions when confidence drops, helping learners reinforce tricky concepts quickly.
- **Demo days**: Learners can publish mini projects directly from the app to showcase progress and invite feedback from peers.

## Content pipeline
{: #content .nav-scroll-anchor }

- **Curriculum builder**: A macOS editor lets me design new lessons, author interactive explanations, and push updates via CloudKit without submitting a new binary.
- **Community contributions**: Future versions will let trusted mentors contribute lessons that go through a lightweight review workflow.
- **Analytics & support**: Opt-in analytics highlight where learners get stuck so I can prioritise new walkthroughs and office hours.

## Roadmap
{: #roadmap .nav-scroll-anchor }

1. **Mentor subscriptions** – Offer 1:1 support packages with scheduled check-ins and code reviews.
2. **ARKit labs** – Introduce mixed-reality projects that blend spatial design with SwiftUI.
3. **Certification prep** – Build mock exams and revision tracks aligned to Apple’s certification pathways.
