# GK Tracker UI Redesign — Requirements Brief

**Date:** 2026-08-07
**Audience:** Designer handoff (visual/UX design, not implementation)

## Purpose & Scope

**Purpose:** Union30 GA Chart (working title) is a mobile tool coaches use pitch-side to log goals conceded by a goalkeeper, capturing where the play originated, how it was finished, and where it entered the goal. The current version is functional but visually rough (default form styling, native browser alerts, no way to review past data). This redesign should make it feel like a real, trustworthy coaching tool — fast to use standing on a sideline, and credible enough that multiple coaches adopt it without training.

**Users:** Coaches, on their own phones, standing on the sideline during games or practices. Not a desktop tool for this flow — one-handed, quick-glance use is the baseline assumption.

**In scope:**
- Redesign of the full logging flow (GK info entry → origin zone → finish type → goal entry zone → confirmation)
- A new per-goalkeeper stats view (mobile-first) to review logged data after the fact
- Visual identity direction reflecting Union30 (no existing brand assets — designer has creative freedom within a "club soccer" feel)

**Out of scope:**
- Desktop-optimized layouts (mobile-first everywhere; desktop just shouldn't break)
- GK roster/profile management (name/age/level stay free-text entry, not saved profiles)
- Team-wide/aggregate stats across all GKs (stats view is single-GK only)
- Backend/data model changes beyond what's needed to support the stats view

## Logging Flow (screens 1–4)

The flow's four steps should stay conceptually intact, but the designer has latitude to change layout/pacing (e.g., combine steps, change modal-vs-page structure) if it improves usability.

**1. GK Info Entry** — Name (text), Age Group (text, e.g. "U14"), Level of Play (text, e.g. "Academy"). Must be filled before a coach can log a goal; currently enforced with a blocking alert — needs a non-jarring inline validation instead (e.g. disabled state, inline hint). These fields should stay visible/persistent while logging multiple goals in one session — no need to re-enter per goal, but no save/roster either (per scope).

**2. Origin Zone (field diagram)** — Tappable zones on a soccer field graphic marking where the play/cross originated (7 zones: Deep, Wide Left/Right, Shooting, Cutback Left/Right, Danger Zone). This diagram is the visual centerpiece of the app and should stay a diagram-based tap interaction — redesign its look, not its concept. Tap targets need to be comfortably thumb-sized even on smaller phones.

**3. Finish Type** — Single choice from a short fixed list (Direct Shot, Strike, Own Goal, Header). Currently a 2×2 button grid in a modal.

**4. Goal Entry Zone (net diagram)** — Tappable zones on a goal-net graphic marking where the ball crossed the line (6 zones: Top/Bottom × Left/Center/Right). Same diagram-based interaction principle as step 2.

Logging a goal should feel fast enough to do multiple times per minute during a game — minimize taps, avoid anything that requires re-reading instructions after the first use.

## Confirmation

After a goal is logged, the coach currently sees a native browser `alert()` — which blocks the whole page, looks broken/unstyled, and requires an extra tap to dismiss before continuing. This should become an in-app confirmation (toast, slide-up panel, or similar — designer's call) that:

- Confirms what was just logged, in plain language: GK name/age/level, and the origin → finish → entry sequence (e.g. "Wide Zone Left → Header → Top Right")
- Shows the one stat currently calculated: what % of all logged goals (across all GKs) match this exact origin + finish + entry combination
- Preserves the celebratory, personal tone of the current version — including the "You'll Never Walk Alone" line — as a deliberate bit of team culture/personality, not boilerplate
- Dismisses easily and returns the coach to a ready-to-log-the-next-goal state without re-entering GK info

Open question for the designer: whether this confirmation is a lightweight overlay (keeps the coach in flow) or a brief full-screen moment (more room for the celebratory tone) — flagging as a decision point rather than prescribing it.

## Stats View (per-GK)

A new screen, accessed separately from the logging flow (e.g. a nav toggle or tab — exact entry point is the designer's call). Shows historical data for **one goalkeeper at a time**, selected by typing/matching the same name used during logging (no saved roster, per scope — so exact-name matching is the only lookup mechanism, which the designer should design around, e.g. a simple search/autocomplete from past entries rather than a dropdown of "known" GKs).

For the selected GK, the view should surface:
- Total goals logged for that GK
- Breakdown by origin zone (which zones goals originate from most)
- Breakdown by finish type (Direct Shot / Strike / Own Goal / Header)
- Breakdown by goal entry zone (where shots are beating them)

The goal is pattern-spotting a coach can act on ("this GK gets beaten far post on crosses from the wide left more than anything else") — so the breakdowns matter more than raw totals. Whether this is presented as simple ranked lists, mini bar charts, or overlaid back onto the field/goal diagrams from the logging flow is open to the designer; reusing the diagram visual language from the logging flow is worth calling out as a nice-to-have for visual consistency, not a requirement.

Mobile-first, as established — no desktop-specific layout needed.

## Visual Direction, Environment Constraints & Open Items

**Visual/brand direction:** No formal Union30 brand assets exist, so the designer has creative freedom within a "club soccer" identity — the current dark theme with green pitch-inspired accents has worked well and can be a starting reference, not a constraint. Designer should propose typography, color system, and spacing rather than inherit the current ad-hoc styling.

**Environment constraints (important — these are real usage conditions, not nice-to-haves):**
- Used outdoors, often in direct sunlight — needs strong contrast and legibility, not just aesthetic dark mode
- Used one-handed while standing, often mid-game — large tap targets, minimal precision required, no fine-print or small controls
- Used in short, repeated bursts (log a goal, glance away, log another) — the UI should support fast re-entry into "ready to log" state, not linger on decorative transitions

**Tone:** Functional and fast first, but with room for personality (per the confirmation screen) — this is a team tool coaches will use dozens of times per game, not a sterile enterprise app.

**Open items to flag for the designer** (decisions intentionally left to them, not gaps in this brief):
- Whether confirmation is an overlay or full-screen moment
- Whether stats view reuses the field/goal diagram visuals or uses charts/lists
- How GK name lookup is presented in the stats view (search vs. recent list)
- Full color/typography system
