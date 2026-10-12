# Architecture

## Production (AWS)

```mermaid
flowchart LR
    U[Browser] -->|HTTP| EB

    subgraph AWS["AWS ap-south-1 (Mumbai)"]
        subgraph EB["Elastic Beanstalk (single instance, Node.js 22 on Amazon Linux 2023)"]
            N[nginx] --> X["Express: REST API + React build"]
        end
        X -->|"PostgreSQL :5432 (SG-restricted)"| R[("RDS PostgreSQL 16 (private)")]
        EB -.->|logs, health| CW[CloudWatch]
    end
```

## Delivery pipeline

```mermaid
flowchart LR
    G[git push] --> A[GitHub Actions]
    A --> L[Lint]
    A --> T[Tests with PostgreSQL]
    A --> B[Build]
    A --> S["npm audit + Trivy (repo and images)"]
    S --> P{Pass?}
    P -->|yes| Z[make-bundle.sh zip]
    Z --> D["Upload to Elastic Beanstalk (manual)"]
    D --> H["Hook: migrate + seed if empty"]
```

## Local (Docker Compose)

```mermaid
flowchart LR
    B[Browser] --> F["frontend: nginx :8080"]
    F -->|"/api"| K["backend: Express :3000"]
    K --> D[("PostgreSQL 16")]
```

## Key decisions

| Decision | Reason |
|---|---|
| Express serves the React build in production | One deployable unit, one Beanstalk environment, no CORS problems |
| Risk level computed, not stored | Changing a threshold never leaves stale data |
| Rule-based risk model | Transparent and explainable; the UI states it is a demo model, not a medical prediction |
| Single-instance environment | No load balancer cost; enough for a demo |
| RDS created separately from Beanstalk | The database survives environment rebuilds |
| Migrations in a `predeploy` hook | Schema changes apply before the new version starts; a failure keeps the old version serving |
| Seed only when the database is empty | A redeploy can never wipe edited data |
| Alerts only when stock gets worse | Raising stock does not create a warning |
