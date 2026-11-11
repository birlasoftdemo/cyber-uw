# Cytora API note

## Overview

Cytora Risk Digitization platform.

## Base URL

Gateway: `https://api.cytora.com`. Reference docs at https://docs.cytora.com/ are password-walled.

## Auth

OAuth 2.0 client credentials from Cytora's Auth0 tenant. Send the access token as `Authorization: Bearer <token>`.

## Call for a single insured

Observed `/v2` resources are workspaces, inboxes, and records. A submission is read as a record. These paths are observations from the Risk Console client, not a published partner contract. The methods below are the ordinary REST reading of those paths.

```
POST https://cytora-prod.eu.auth0.com/oauth/token
GET  https://api.cytora.com/v2/workspaces/{workspaceId}/inboxes/{inboxId}/records/{recordId}
GET  https://api.cytora.com/v2/workspaces/{workspaceId}/inboxes/{inboxId}/records/{recordId}/fields
GET  https://api.cytora.com/v2/workspaces/{workspaceId}/inboxes/{inboxId}/records/{recordId}/actions
```

`outputs.json` holds a static output for each call. The record GET output is the same body as `response.json`. The token output follows a normal OAuth client-credentials response and uses a demo token only.

## Fields in the static response

| Field | Description |
|-------|-------------|
| `_fixture` | Marker: `illustrative` |
| `record.id` | Demo record id |
| `record.workspace` | Demo workspace label |
| `record.inbox` | Demo inbox label |
| `record.received_at` | Demo received timestamp |
| `record.insured_name` | Demo insured name |
| `record.line_of_business` | `cyber` |
| `record.extracted_fields` | Demo `revenue`, `employees`, `industry` |
| `appetite.decision` | `in_appetite`, `refer`, or `out` |
| `appetite.score` | Illustrative score |
| `appetite.reasons[]` | Reason strings |
| `risk_factors[]` | Items with `name`, `value`, `impact` |

## Schema gap

No response schema is public; the field names are a local model of published product concepts, not a vendor schema. `response.json` and `outputs.json` must not be treated as an official Cytora response.

## Sources

- https://apis.io/apis/cytora/cytora-platform-api/
- https://raw.githubusercontent.com/api-evangelist/cytora/refs/heads/main/conventions/cytora-conventions.yml
