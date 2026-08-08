---
app: homeos
date: 2026-07-07
title: Virtualising a dumb heated towel rail as a smart thermostat
summary: A dumb electric heated towel rail, made to behave like a real HomeKit thermostat with a target temperature it actually chases.
anchor: towel-rail-thermostat
---
The bathroom towel rail was a dumb electric heater: on or off, with no sense
of the room. The goal was to make it present in Apple Home as a real
thermostat, with a setpoint and a reading it chases.

The brain is Home Assistant's `generic_thermostat`. It reads room
temperature from an FP300 multi-sensor (Matter) and switches a relay when the
room drifts below the target, exactly as a thermostat would. That virtual
thermostat is exposed to HomeKit through the HASS bridge, and a set of Apple
Home mirror automations keep the two views in step so the rail can be driven
from either side.

The honest edges: the sensor and the relay are separate devices, so the loop
is only as tight as their reporting; and the current relay is a stopgap
pending a Matter contactor that would make the control path HomeKit-native
end to end. But the outcome is real. A heated towel rail that used to be a
switch now holds a temperature, shows its state in the Home app, and can be
automated like any other thermostat.
