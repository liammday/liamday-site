---
app: homeos
date: 2026-07-09
title: A local temperature-tracker dashboard
summary: An on-Mac tool that logs every room's temperature and humidity against the weather outside, and shades exactly when the sun is on the glass.
anchor: temperature-dashboard
---
Before automating the climate I wanted to see it. The temperature tracker is
a small tool that runs entirely on my Mac. It reads every HomeKit
temperature, humidity and blind sensor through a local bridge, pulls outdoor
temperature and humidity from a free weather source keyed to the house
coordinates, logs both to a local database every few minutes, and renders a
live, zoomable dashboard.

The design lesson was in the encoding. With several rooms, an outdoor line, a
comfort band and a stack of on-off states all fighting for the same chart,
colour alone stopped being enough. The fix was to give each kind of data its
own channel: room lines are per-location averages, the outdoor line is a
distinct dashed reference, and the on-off states (day and night, sun on the
windows, blinds open or closed) moved off the plot into slim ribbon tracks
beneath it. It computes the sun's position from the site's latitude and
longitude to shade exactly when the sun is on the glazed wall, which turned
out to be the clearest predictor of a room heating up.

It is deliberately local and dependency-light, and it doubles as the
instrument panel for the automations that came next. If a rule is going to
act on "hotter outside than in" or "sun on the glass", this is where I can
watch it be true.
