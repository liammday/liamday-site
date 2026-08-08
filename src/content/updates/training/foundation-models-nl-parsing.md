---
app: training
date: 2026-01-18
title: Foundation Models replace the regex parser
summary: Natural-language workout entry moves from hand-written regex to on-device Foundation Models.
anchor: foundation-models-nl-parsing
---
A natural-language input field let a session be typed as a sentence and
parsed into a structured planned workout. The first version used a
hand-written parser and gazetteer; within days it was rebuilt on Apple's
Foundation Models framework for iOS 26 and up, with confidence-based
disambiguation for ambiguous phrasing and the legacy regex parser removed
once the new path proved reliable. A structured fallback sheet was kept for
anything the parser could not resolve with confidence.
