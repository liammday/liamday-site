---
app: peaking
date: 2025-03-11
title: The OSM rewrite
summary: A working-but-slow MapKit prototype is stripped back and rebuilt on OpenStreetMap data.
anchor: osm-rewrite
---
A first attempt at a map-first version shipped internally but performed
poorly and its import pipeline did not work reliably, so it was deliberately
stripped back to the key layout elements and rebuilt on new SwiftData models.
The rebuild moved peak data onto OpenStreetMap nodes and relations via the
Overpass API, with a dedicated map controller and an actor-isolated API
layer to keep large node sets off the main thread. This is the point the app
stopped being a demo and became an engineering problem: rendering thousands
of peaks on a map without stalling it.
