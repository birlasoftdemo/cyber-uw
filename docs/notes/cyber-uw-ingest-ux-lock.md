---
title: Cyber UW ingest — dual UX lock
date: 2026-07-24
context: gsd-explore session on broker questionnaire AI intake + broker-facing submission service
source_research: _bmad-output/forge/cyber-uw-second-product/USER-RESEARCH.md
---

# Cyber UW ingest — dual UX lock

## Product frame

- **Buyer / primary underwriting user:** carrier / MGA processing underwriting.
- **Full product (later):** ingest → triage → risk → score → close / completed workflow.
- **Research insight (attest vs signal):** underwriter job is reconcile claim vs signal, then decide and defend. Intake alone is parity; structure must support later attest-versus-signal. Provenance contextualized to mapped fields.

## This slice — uniformity pillars

1. Uniformity in ingestion
2. Uniformity in output (pattern/pipeline; schemas may be custom end-to-end per carrier/MGA)
3. Where the user sees output
4. How the user proceeds toward risk reconcile

## Underwriter experience (workbench)

- **Land after ingest:** submission dossier / field board inside the workbench (not PAS/email first).
- **Day-one field actions:** correct mapping, gap/missing flags, cite-back to source, bookmark for referral, flag, re-verify.
- **Re-verify:** re-run extraction/mapping from the source document.
- **Deferred:** broker messaging, Ask AI check.
- **Proceed:** open referral bookmark queue (bookmarked fields become next work surface).

## Broker-facing service (replace manual PDF)

- **Filler:** insurance broker.
- **Pains (all real):** chase insured for answers; re-key across carrier PDFs; unclear which questions this carrier needs.
- **Method lock:** Typeform-style guided questionnaire + dossier → **in-field prefill with provenance rail** (Confirm / Clear).
- **Session:** New client / Existing client / Resume; Save for later; Share.
- **Review:** editable rows (edit/delete); logged-in user; email copy; CC list.
- **Path:** adaptive (LoB, geography, limit, prior answers) — carrier/MGA-configured; expanded field catalog in UI-SPEC §4.
- **Out as v1 happy path:** voice; email scrape (keep as later fallback / messy ingest).
- **Sketch:** `sketches/002-typeform-questionnaire/`.

## Data / schema posture

- Field catalogs and process data structures: **carrier/MGA-dependent**, personalized to process; can be custom end-to-end.
- Shared product behavior: ingest → structured output → dossier/board → referral queue pattern.
- Attestation metadata: contextualize to mapped fields (hook for later attest-vs-signal).

## Dual storyboard (one line)

Broker: upload dossier → Typeform one-question adaptive path (Accept proposals) → review/submit  
→ Underwriter: field board (correct / gap / cite / bookmark / re-verify) → referral bookmark queue.
