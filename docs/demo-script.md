# Demo script (about 5 minutes)

Open before starting: the live URL, the GitHub repo, the Actions tab, the AWS console (Elastic Beanstalk).

| # | Show | Say |
|---|---|---|
| 1 | Live site, **Dashboard** | "BloodFlow India monitors blood stock across demo facilities. All data is synthetic." |
| 2 | Banner, cards, chart | "The banner and cards are built from real counts. A droplet turns red only when a facility is critical." |
| 3 | Toggle **dark mode** | "Light and dark themes, and it works on phones." |
| 4 | **Availability**: O+, Pune | "Three Pune O+ rows, most urgent first." |
| 5 | Click **Explain** | "Every risk level explains why. It is a transparent rule, not a prediction." |
| 6 | **Admin**, log in | "Only admins can change stock. The API refuses writes without a token." |
| 7 | Change Pune Lifeline 18 to **3**, Save | "The risk changes from MEDIUM to CRITICAL." |
| 8 | **Dashboard** | "Critical count went up and a new alert appeared." |
| 9 | GitHub repo, **Actions** | "Every push runs lint, 94 backend tests against a real PostgreSQL, a build and security scans." |
| 10 | The **Trivy** step | "Trivy scans dependencies and both container images. The build fails on fixable HIGH or CRITICAL findings." |
| 11 | AWS **Elastic Beanstalk**, health Ok | "Node.js 22 on Elastic Beanstalk, with the database on private RDS PostgreSQL." |
| 12 | Terminal: `./scripts/smoke-test.sh` | "One command verifies the deployment: health, database, auth and security headers." |

Close by naming one honest limitation (HTTP only, certificate not verified) and one future step (automatic deployment).y

