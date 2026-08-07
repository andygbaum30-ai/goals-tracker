# GK Tracker Welcome Screen — Design

**Date:** 2026-08-07

## Purpose

The app currently opens straight into the Goalkeeper info entry form, with no explanation of what it's for. Coaches operate the app, but the messaging should speak to the goalkeeper: they're the subject of the data, and the app should make clear — warmly, with a light touch — that this exists to help them improve, not to keep score against them.

## Flow & Behavior

A new welcome screen is inserted before the existing "Goalkeeper" info step. On a device's first visit (no `localStorage` flag set), the app shows the welcome screen instead of the GK info form. Tapping the CTA ("Let's Go") sets the flag and reveals the normal flow underneath — GK info entry, then origin → finish → goal entry, unchanged from today.

On every subsequent visit, the flag is already set, so the app skips straight to the GK info form (today's default) — coaches mid-game aren't slowed down by an intro they've already seen.

Edge case: a first visit via a direct link to `/#stats` still shows the welcome screen first — the check only cares whether this device has seen the intro, not which route was requested. Once dismissed, it won't reappear on that device.

Structurally this is a fifth screen/state alongside the existing four log steps (`welcome`, `info`, `origin`, `finish`, `goal`), following the same show/hide toggling pattern already used for steps — no new architecture.

## Content

> **YOUR OWN SCOUTING REPORT**
>
> Every goal gets tagged — origin, finish, where it landed. Over time it adds up to something useful: a real picture of what's actually beating you, straight from game day, not guesswork.
>
> `[ Let's Go ]`

Notes:
- No GK name is referenced — this screen appears before the GK info form exists, so the copy stays general ("you").
- No secondary "skip" or "learn more" link. One message, one button.

## Visual Treatment

Type-led, no icon or illustration — consistent with the rest of the app. Reuses existing classes: `.step-title` for the headline (Barlow Condensed, 800 weight, uppercase), the same muted body-text treatment as the GK form's subtext, and `.btn-primary` for the CTA. No new CSS needed.

## Implementation

- New `#step-welcome` section in `index.html`, built entirely from existing classes.
- In `main.js`: on load, check `localStorage.getItem('gk-tracker-welcomed')`. If unset, initial step is `'welcome'` instead of `'info'`.
- The CTA sets `localStorage.setItem('gk-tracker-welcomed', '1')` and calls `setStep('info')`.
- The persistent `gk-header` chip stays hidden during the welcome step, same as it already does for the info step.
