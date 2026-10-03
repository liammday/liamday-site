---
layout: ../../layouts/PostLayout.astro
title: Peaking — Privacy Policy
description: How Peaking handles your data.
date: 2026-10-02
---

**Controller:** Liam Day (sole trader), United Kingdom.
**Contact:** [liam@liamday.co.uk](mailto:liam@liamday.co.uk)

Peaking is an iOS app for walkers, runners and cyclists that visualises mountain peaks, summits and routes. This policy explains what data the app handles, where it is stored, and what your rights are.

## Summary

- Peaking does not run a server. Your data is stored on your device and, if you are signed in to iCloud, in your own private iCloud account.
- The app connects to third-party services (Apple HealthKit, Strava, Apple Photos, OpenStreetMap, Apple Weather) only with your explicit consent and only to fetch data you have asked for.
- We do not sell your data. We do not use advertising trackers. We do not share your data with anyone except where necessary to deliver the features you have turned on.

## Data we handle

### Health and activity data (HealthKit)

When you grant HealthKit access, Peaking reads workouts and route data from your Apple Health store so it can match them against mountains and summits. This data is read into memory and stored on your device (and mirrored to your private iCloud account if iCloud is enabled). It is never sent to us or to any third party.

### Strava data

When you connect your Strava account, Peaking uses Strava's OAuth flow to request a short-lived access token and a refresh token. These tokens are stored on your device and are never transmitted to us. With those tokens, Peaking fetches your Strava activity list, GPS tracks and activity details directly from Strava's API to your device, where they are used to reconstruct routes and attribute summits. Peaking keeps raw Strava data, such as an activity's GPS track, on your device only and for no more than seven days, as Strava's API terms require. It is never copied to iCloud. After seven days Peaking fetches a track from Strava again only when you open that route, or when Peaking re-checks your routes for summits (for example after an update to its peak list), and only within Strava's usage limits. What Peaking works out from your Strava activities, such as the summits you reached and a route's date, distance, elevation and its start and end points, is your own record and is kept on your device and in your private iCloud mirror for as long as you use the app.

If you share with friends in Peaking, what they see can include summits Peaking found on your Strava activities, and achievement progress that those summits count towards. For each summit, only the summit and when you reached it are shared, never a Strava track or any other route geometry. Strava may collect usage data about Peaking's use of the Strava API, as described in Strava's API Agreement.

You can disconnect Strava at any time from **Settings → Permissions & Connected Services → Strava Sync Status → Disconnect Strava**. Disconnecting stops future syncs, revokes Peaking's access to your Strava account and deletes the tokens. It also deletes the Strava data Peaking holds: routes imported only from Strava, and summits found only on those routes. Routes that Apple Health also recorded are kept, as are summits you logged yourself or that a photo or another route supports. To delete every piece of Strava-sourced data without disconnecting, use **Settings → Permissions & Connected Services → Strava Sync Status → Remove all Strava data**.

Peaking follows Strava's brand guidelines and links back to Strava for every Strava-sourced activity. Your relationship with Strava remains governed by [Strava's own Privacy Policy](https://www.strava.com/legal/privacy).

### Photos

If you grant Photos access, Peaking reads photos that have location metadata so it can match them against peaks you have visited. Only metadata (location, timestamp) is read; photo pixel data stays in the Photos library.

### Location

Peaking requests Location access to centre the map on you and to match your current position to nearby peaks. Location data is not logged or transmitted off-device.

### Map and weather data

Peaking loads map tiles from OpenStreetMap and weather forecasts from Apple's WeatherKit service when you open a peak. These requests are made directly from your device to those services. We do not log or proxy them.

## Data we do not collect

Peaking has no analytics, no crash-reporting SDK, no advertising identifiers, no user accounts on our servers, no mailing lists, and no telemetry that reports back to the developer.

## Where your data lives

- **On your device.** All data the app uses day-to-day is stored locally on your iPhone.
- **In your private iCloud.** If you are signed in to iCloud and have iCloud for this app enabled, iOS mirrors the app's data to your own iCloud account. Apple is the data processor for that mirror; we have no access to it.
- **On Strava's servers.** If you connect Strava, your relationship with Strava is governed by Strava's policies. Peaking holds raw Strava data on your device for at most seven days; see *Strava data* above.

## Data retention

Peaking keeps data for as long as you have the app installed, except raw Strava data such as GPS tracks, which it keeps for at most seven days (see *Strava data* above). Deleting the app, or signing out of iCloud, removes the local and mirrored copies. You can also delete individual routes, activities and integrations from within the app.

## Your rights (UK GDPR)

You have the right to access, correct, delete and restrict processing of your data. Because Peaking does not hold your data on our servers, most of these rights are exercised directly in the app. If you believe we hold data about you off-device, email [liam@liamday.co.uk](mailto:liam@liamday.co.uk) and we will respond within 30 days. You also have the right to complain to the [UK Information Commissioner's Office](https://ico.org.uk).

## Children

Peaking is not directed at children under 13 and we do not knowingly handle data from children under 13.

## Changes to this policy

If this policy changes, the date at the top of this page will change and the new version will be published at this URL. Material changes will be announced inside the app before they take effect.

## Contact

Any questions about this policy or your data: [liam@liamday.co.uk](mailto:liam@liamday.co.uk).
