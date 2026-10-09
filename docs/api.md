# BloodFlow India API

Base URL (local): `http://localhost:3000`

> All data is **synthetic demo data**. The risk level comes from a simple,
> configurable, rule-based MVP model. It is **not** a medical prediction.

## Response format

```json
{ "success": true, "data": {}, "meta": {} }
```

```json
{ "success": false, "error": { "message": "Invalid blood group", "details": [{ "field": "bloodGroup", "message": "Invalid blood group" }] } }
```

`details` appears only for validation errors.

## Status codes

200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden,
404 Not Found, 409 Conflict, 413 Payload Too Large, 429 Too Many Requests,
500 Internal Server Error.

## Risk levels (defaults, configurable via environment)

| Units | Level |
|---|---|
| >= 20 | LOW |
| 10 to 19 | MEDIUM |
| 5 to 9 | HIGH |
| < 5 | CRITICAL |

Dashboard "Low stock" counts HIGH rows. "Critical" counts CRITICAL rows.

## Endpoints

### Health
`GET /health` returns `{"status":"healthy","service":"bloodflow-backend"}`

### Auth
`POST /api/auth/login` with `{ "email", "password" }` returns `data.token` and `data.user`.
Send the token as `Authorization: Bearer <token>`. Limited to 10 attempts per 15 minutes.

### Blood inventory
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/blood` | public | Filters: `bloodGroup` (use `%2B` for `+`), `city`, `risk` |
| GET | `/api/blood/:id` | public | |
| POST | `/api/blood` | admin | Body: `facilityId`, `bloodGroup`, `unitsAvailable` |
| PUT | `/api/blood/:id` | admin | Body: `unitsAvailable` |
| DELETE | `/api/blood/:id` | admin | |

Each row includes `risk: { level, reason }`. Blood groups: A+ A- B+ B- AB+ AB- O+ O-.
Units: whole number from 0 to `MAX_UNITS` (default 500). One row per facility and blood group (409 on duplicates).

### Facilities (hospitals and blood banks)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/hospitals` | Filters: `city`, `type` (HOSPITAL or BLOOD_BANK). Includes `stats` |
| GET | `/api/hospitals/:id` | Includes `stats` and `inventory` with risk reasons |

### Dashboard
`GET /api/dashboard` returns `totals`, `riskDistribution`, `bloodGroups`, `locations`,
`recentUpdates`, and `riskThresholds`.

### Alerts
`GET /api/alerts?limit=20` returns recent alerts, newest first (limit 1 to 100).
An alert is created when stock becomes HIGH or CRITICAL, or gets worse.
