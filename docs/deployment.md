# AWS Deployment Guide

BloodFlow India runs on **AWS Elastic Beanstalk** (single instance) with **Amazon RDS PostgreSQL**.
All data is synthetic demo data.

```
Internet → Elastic Beanstalk (nginx → Express + React build) → RDS PostgreSQL (private)
```

## Resources

| Resource | Purpose | Notes |
|---|---|---|
| Elastic Beanstalk environment | Runs the Node.js 22 app (Amazon Linux 2023) | Single instance, no load balancer |
| EC2 instance (t3.micro) | The server | Created by Elastic Beanstalk |
| RDS PostgreSQL 16 | Database | Not publicly accessible, single-AZ, 20 GiB gp3 |
| Security group `bloodflow-rds-sg` | Allows port 5432 **only** from the app's security group | |
| S3 bucket (auto-created) | Stores deployment bundles | |
| CloudWatch Logs | App, nginx and engine logs | 7-day retention, deleted on termination |

Region: Asia Pacific (Mumbai) `ap-south-1`.

## Environment properties (set in the console, never in Git)

| Name | Purpose |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Elastic Beanstalk's nginx forwards to this port) |
| `JWT_SECRET` | Signs login tokens (random 64 hex characters, unique per environment) |
| `DATABASE_URL` | RDS connection string, with `sslmode=require&sslaccept=accept_invalid_certs` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used once to create the demo admin when the database is empty |

## Deploying a new version

```bash
./scripts/make-bundle.sh            # builds React, assembles the zip in build/
```

Console: Environment → **Upload and deploy** → choose the newest zip → give it a **new** version label.

The zip contains the backend source, `prisma/`, the built React app (`public/`) and `.platform/hooks`.
Elastic Beanstalk runs `npm install` (which generates the Prisma client), then runs
`.platform/hooks/predeploy/01_database.sh`, which:

1. applies pending Prisma migrations (`prisma migrate deploy`)
2. loads the synthetic demo data **only if the database has no facilities** (it never wipes data)

If the hook fails, the deployment fails and the previous version keeps serving.

## Verifying a deployment

```bash
./scripts/smoke-test.sh http://<environment-domain>
```

It checks `/health`, the React app, the SPA fallback, database-backed endpoints, authentication on write
routes, that `/.env` exposes nothing, and that security headers are present.

## Monitoring

- **Health and graphs:** Environment → Health & monitoring (CPU, requests, 2xx/5xx).
- **Logs:** CloudWatch → Log groups → `/aws/elasticbeanstalk/<environment>/...`
  (`web.stdout.log` is the app, `nginx/access.log` shows requests, `eb-hooks.log` shows the migration hook).
- **Alerts:** Elastic Beanstalk email notifications on health changes.

## Problems hit during the first deployment (and fixes)

| Symptom | Cause | Fix |
|---|---|---|
| 502 risk on first deploy | Elastic Beanstalk's proxy forwards to port 5000 by default; the app defaulted to 3000 | Set the `PORT=5000` property |
| Deploy failed: `P1001 Can't reach database server at localhost:5432` | `DATABASE_URL` was still the placeholder when the migration hook ran | Update the property first, then redeploy |
| `Authentication failed ... for bloodflow-db` | The server's instance name was used as the username | Use the real master username |
| `Database "bloodflow-db" does not exist` | "Initial database name" was left empty when creating the RDS instance | Prisma created the database during the first migration |
| Environment "Severe" after a failed deploy | Instance and environment disagreed on the version | A successful redeploy cleared it |

## Security notes

- The database is private and reachable only from the app's security group.
- The site is served over **HTTP** (single instance, no certificate). Real HTTPS needs a load balancer,
  an ACM certificate and a domain. HSTS is therefore off unless `FORCE_HTTPS=true`.
- The database connection is encrypted but the RDS certificate is not verified
  (`sslaccept=accept_invalid_certs`). Verifying it with the RDS CA bundle is a planned improvement.
- The public instance is scanned by bots within hours (requests for `/.env` and similar appear in the nginx
  log). The app returns the home page for unknown paths, and the bundle contains no `.env` file.
- Secrets live in Elastic Beanstalk environment properties, which anyone with access to the AWS account can read.
  AWS Secrets Manager is the stricter option.

## Cost and cleanup

The EC2 instance, its public IPv4 address and the RDS instance bill by the hour. After the hackathon:

1. Elastic Beanstalk: **Terminate environment**, then delete the application.
2. RDS: delete `bloodflow-db` (skip the final snapshot; the data is synthetic).
3. EC2 → Security groups: delete `bloodflow-rds-sg`.
4. S3: empty and delete the `elasticbeanstalk-ap-south-1-...` bucket.
5. CloudWatch: confirm no log groups remain.y

