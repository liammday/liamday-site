---
app: peaking
date: 2025-11-15
title: Friends and achievements land before the tags do
summary: Social features and progress tracking arrive ahead of any formal versioning.
anchor: friends-achievements
---
Friends and Achievements tabs were added to the navigation, giving the app
its social dimension — seeing what peaks friends had summited — well before
the project adopted version tags. This period also carried the CloudKit
migration warnings that come with any SwiftData-backed sync model: renaming
a field is a one-way door once records exist in production, a lesson that
shaped how cautiously the schema was changed from here on.
