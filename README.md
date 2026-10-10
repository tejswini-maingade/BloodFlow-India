# 🩸 BloodFlow India

**Monitor blood availability. Identify shortage risks. Respond faster.**

> ⚠️ **Demo project.** This application uses clearly labelled **synthetic/demo data**.
> It does not represent real hospitals and does not provide real-time or medical data.
> The shortage-risk model is a simple rule-based MVP, not a medical prediction.

Built for the **Build on Elastic Beanstalk Hackathon by TrainWithShubham**.

## Status

🚧 Phase 1: repository setup and backend skeleton.

## Quick start (backend)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
curl http://localhost:3000/health
```

More documentation will be added as the project grows.

## Database (local)

```bash
docker compose up -d db          # start PostgreSQL
cd backend && npm install
npx prisma migrate dev           # create tables
npm run db:seed                  # load SYNTHETIC demo data
npm test                         # run tests
```

**Demo data:** all facilities in the seed are fictional and labelled "(Demo)".

### API tests

Tests use a separate `bloodflow_test` database (never your dev data):

```bash
docker exec bloodflow-db psql -U bloodflow -d bloodflow -c "CREATE DATABASE bloodflow_test;"   # once
npm run db:migrate:test    # once, and after each schema migration
npm test
```
### Frontend (local)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api to the backend on :3000)
```

### Run as a single app (production-style)

```bash
cd frontend && npm run build
cd ../backend && npm start      # API + React app on http://localhost:3000
```

Express serves the built React app, so one process (and one port) is all Elastic Beanstalk needs.
Set `FORCE_HTTPS=true` only when the site is served over HTTPS.

## Docker

```bash
cp .env.example .env            # then fill in JWT_SECRET and admin values
docker compose up -d --build    # db + backend (:3000) + frontend (:8080)
docker compose exec backend node prisma/seed.js    # load SYNTHETIC demo data
docker compose ps
docker compose logs backend
docker compose down             # add -v to also delete the database volume
```

**Pinned dependency:** Prisma is pinned to exactly `6.12.0`. Newer versions pull in a
`deepmerge-ts` release affected by advisory GHSA-ggr8-5vv4-36mx (a build-time config merge
library, not reachable from API input). Revisit when Prisma publishes a fixed release.
