---
layout: ../layouts/PostLayout.astro
title: Peaking
description: An iOS app for walkers, runners and cyclists that turns your GPS history into a map of the peaks you've climbed.
date: 2026-04-21
---

Peaking is an iOS app in private beta. It takes your activity history from Apple HealthKit or Strava and plots it against the mountain peaks, summits and ridges you actually crossed — turning your Strava feed into a map of the high ground you've covered.

## What it does

- Matches your GPS routes to peaks, summits and named high points across the UK and Ireland.
- Shows you what you've climbed, what's near, and what's next — on a clean, fast map.
- Pulls route data from **Apple HealthKit** or **Strava**, with your permission. Everything is stored on your device and, if you use iCloud, in your own private iCloud account. No server. No analytics. No ads.

## Which devices and apps work?

Peaking matches your walks against peaks using the GPS route attached to each workout in Apple Health. Not every fitness device writes that route, so it's worth knowing before you sign up.

**Works today (route flows through to Peaking):**

- **Apple Watch** — outdoor walking, running, hiking and cycling workouts. The canonical happy path.
- **Third-party iOS recording apps** that write routes to Apple Health — Strava (when you record in Strava itself), Nike Run Club, Footpath, WorkOutDoors and similar.
- **Photos with location** — geotagged photos are suggested as Photo Summits automatically.

**Doesn't work directly (the route doesn't reach Apple Health):**

Garmin Connect, COROS, Polar Flow, Suunto, Wahoo, Fitbit, AllTrails, Komoot. Each vendor's Apple Health integration is summary-only — distance, time, heart rate — but no GPS route.

**Rescue path for Garmin / Polar / Suunto users:** the iOS bridge apps **HealthFit** and **RunGap** pull the original workout file from your vendor's cloud and rewrite it into Apple Health with the route intact. Peaking can then match those exactly like an Apple Watch workout.

Direct Strava OAuth (independent of Apple Health) is in development and gated on Strava API approval.

## Privacy

See the [Peaking privacy policy](/peaking/privacy/) for full detail on what data the app handles, where it lives, and how to delete it.

## Beta access

Peaking is in TestFlight beta. If you'd like early access, email [liam@liamday.co.uk](mailto:liam@liamday.co.uk).
