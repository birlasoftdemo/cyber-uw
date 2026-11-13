# Cyence API note

## Overview

Guidewire Cyence. Access is through a Guidewire account.

## Base URL / Auth

There is no public base URL, OpenAPI document, or example response body. Authentication and the endpoint are provided under a Guidewire account agreement.

## Call for a single insured

A per-company assessment request. The path and auth are supplied by Guidewire on onboarding. The calls below are a hypothesis from the published Rapid Assessment flow (enter a company name, receive a report in about two minutes). They are not a documented Guidewire path.

```
POST https://{cyence-host}/rapid-assessments
GET  https://{cyence-host}/rapid-assessments/{assessmentId}
```

`outputs.json` holds a static output for each call. The GET output is the same body as `response.json`, plus `id` and `status`.

## Published product outputs

- Overall Risk Rating
- Probability of Incident
- Peer comparison
- Exposure Signals (31 as of the Feb 2026 Rapid Assessment note)
- Financial-loss severity

## Fields in the static response

| Field | Description |
|-------|-------------|
| `_fixture` | Marker: `illustrative` |
| `company.name` | Demo insured name |
| `company.domain` | Demo domain |
| `company.industry` | Industry label |
| `risk_rating.score` | Illustrative overall score |
| `risk_rating.band` | Illustrative band label |
| `probability_of_incident.annualized` | Illustrative annualized probability (decimal) |
| `peer_comparison.percentile` | Illustrative percentile vs peer group |
| `peer_comparison.peer_group` | Peer group label |
| `exposure_signals.total` | Count of signals (31) |
| `exposure_signals.samples[]` | Sample signals with `name`, `category`, `status` |
| `loss_estimates.currency` | Currency code |
| `loss_estimates.expected` | Illustrative expected loss |
| `loss_estimates.tail` | Illustrative tail loss |

## Schema gap

The field names are a local model of published product concepts, not a vendor schema. `response.json` and `outputs.json` must not be treated as an official Cyence response.

## Sources

- https://www.guidewire.com/products/analytics/cyence
- https://docs.guidewire.com/cloud/palisades/whatsnew/topics/analytics-release_highlights.html
