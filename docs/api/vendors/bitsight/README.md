# BitSight API note

## Overview

BitSight has a public REST API. The contract below is public, so `response.json` can be modelled against directly.

## Base URL

`https://api.bitsighttech.com/ratings/v1`

## Auth

HTTP Basic over HTTPS only. Send the API token as the username and leave the password empty.

## Calls

Single insured (primary call):

```
GET /companies/{company_guid}?fields=industry_average,industry_percentile
```

Portfolio (second useful call):

```
GET /portfolio/ratings?period=latest&expand=rating_details
```

## Fields in the static response

Numbers in `response.json` are demo values. Field names follow the published Company Details example.

| Field | Description |
|-------|-------------|
| `guid` | Company identifier (UUID-shaped; demo value) |
| `name` | Company name (demo insured) |
| `industry` | Industry label |
| `rating` | Headline security rating (BitSight range 250-900) |
| `rating_details` | Object keyed by risk vector slug |
| `rating_details.<vector>.name` | Vector display name |
| `rating_details.<vector>.rating` | Vector rating value |
| `rating_details.<vector>.grade` | Letter grade for the vector |
| `rating_details.<vector>.percentile` | Percentile for the vector |
| `ratings[]` | Rating history |
| `ratings[].rating_date` | ISO date of the rating |
| `ratings[].rating` | Rating on that date |
| `ratings[].range` | Band label (Basic / Intermediate / Advanced) |
| `industry_average` | Average rating for the industry |
| `industry_percentile` | Company percentile within the industry |

## Sources

- https://help.bitsighttech.com/hc/en-us/articles/231872628-API-Documentation-Overview
- https://help.bitsighttech.com/hc/en-us/articles/360015690713-GET-Company-Details
- https://help.bitsighttech.com/hc/en-us/articles/360037961593-GET-POST-Security-Rating-Details-of-Companies-in-Your-Portfolio
- https://help.bitsighttech.com/hc/en-us/article_attachments/8370119341079
