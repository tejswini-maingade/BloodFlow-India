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
