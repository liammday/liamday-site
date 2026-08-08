---
app: homeos
date: 2026-07-09
title: Injecting virtual sensors to control the internal climate
summary: Computed sensors pushed into HomeKit so the Home app can automate on things it could never measure, like keeping the blinds shut when it is hotter outside.
anchor: virtual-sensor-injection
---
The Home app can automate on a sensor crossing a threshold, but it cannot
compare two values or reason about the sun. So I taught Home Assistant to do
the reasoning and hand the answer back as a sensor.

Seven computed entities now live in a new "Outside" room in Apple Home. Four
are readings: outdoor temperature, humidity, dew point, and an estimated
illuminance derived from sun elevation and cloud cover. Three are booleans
built for automations: **Direct Sun on Windows**, on while the sun's bearing
and elevation put it on the east glazed wall; **High Solar Gain**, when the
sun is on the glass, the sky is fairly clear and it is warm; and **Freezing
Outside** for winter protection. Each is a Home Assistant template, exposed
through the existing HomeKit bridge, so the maths lives in HA and the
decision lives in the Home app.

The point is the pattern, not the seven sensors. It closes the loop the
dashboard opened. Instead of me reading a chart and deciding to shut the
blinds, the house can hold a fact like "the sun is on the glass and it is
hotter outside than in", and the Home app can act on it, keeping the blinds
closed against solar gain in summer and opening them for light and warmth
once the sun has moved on. The known gap: "hotter outside than in" is
currently limited to the one indoor sensor Home Assistant can see, so
bringing the rest of the rooms into HA is what makes the comparison whole.
