# Global Education & Career ROI Calculator

A full-stack web application for estimating the return on investment (ROI) of education across countries, majors, degree levels, and universities. It combines a Spring Boot API, PostgreSQL-backed reference data, and a React/Vite frontend with calculator, comparison, insights, SEO, and shareable report flows.

![EduROI mascot](frontend/Graduation%20Duck%20Walking%20Cycle.gif)

## What’s in this repo

| Path | Purpose |
| --- | --- |
| `frontend/` | React 18 + TypeScript + Vite UI (shadcn/ui, Tailwind, React Query, Recharts) |
| `backend/` | Spring Boot 3.2 / Java 17 REST API, JPA/PostgreSQL, Docker setup |
| `docs/` | Project report/documentation assets |

## Key features

- **ROI calculator** - calculate education cost, opportunity cost, break-even, net ROI, and yearly projections.
- **Shareable results** - UUID-based result links (`/results/:uuid`, `/share/:uuid`).
- **Comparison flow** - compare education/career scenarios through the compare API/UI.
- **Career intelligence & decision confidence** - additional analysis endpoints for career/decision insights.
- **Degree worth-it insights** - insight endpoint/page for degree value analysis.
- **PDF report export** - generate/download ROI report PDFs.
- **Programmatic SEO pages** - SEO page data served by backend and rendered by frontend.
- **Reference data APIs** - countries, majors, degree levels, universities, currencies.
- **Monetization-ready structure** - ad zones, affiliate/lead-oriented backend entities and services.

## Tech stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Radix UI
- React Router, TanStack Query, Axios
- Framer Motion, Recharts
- i18next, react-helmet-async

**Backend**
- Java 17, Spring Boot 3.2
- Spring Web, Data JPA, Validation, Security, Actuator, Cache
- PostgreSQL, optional Redis
- OpenAPI/Swagger (springdoc)
- OpenPDF for report generation
- Docker / Docker Compose

## Project structure

```text
.
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/roicalculator/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Spring Data repositories
│   │   ├── domain/entity/    # JPA entities
│   │   ├── dto/              # Request/response DTOs
│   │   └── config/           # App/security/cache/config
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/               # SQL seed files
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/                 # React/Vite app
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # UI and feature components
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── docs/                     # Project documentation
└── README.md
```

## API overview

Base URL (local): `http://localhost:8080/api/v1`

| Area | Example endpoints |
| --- | --- |
| ROI | `POST /roi/calculate`, `GET /roi/share/{uuid}`, `POST /roi/quick-estimate`, `POST /roi/simulate` |
| Reports | `GET /reports/roi/pdf/{uuid}` |
| Comparison | `POST /compare` |
| Reference data | `GET /data/countries`, `GET /data/majors`, `GET /data/degree-levels`, `GET /data/universities`, `GET /data/currencies` |
| SEO | `GET /seo/pages/{slug}`, `GET /seo/pages` |
| Insights | `GET /insights/degree-worth-it`, `POST /career/intelligence`, `POST /decision/confidence` |

Swagger UI (when backend is running): `http://localhost:8080/swagger-ui.html`

## Local development

### Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- PostgreSQL 16+ (or Docker)

### 1. Clone the repository

```bash
git clone https://github.com/karansahani78/global-education-career-roi-calculator.git
cd global-education-career-roi-calculator
```

### 2. Start the backend

Configure database credentials in `backend/src/main/resources/application.properties` or provide environment variables for your local setup.

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

After the schema is created, load reference data if needed:

```bash
psql -U <db_user> -d <db_name> -f src/main/resources/db/seed_reference_data.sql
psql -U <db_user> -d <db_name> -f src/main/resources/db/seed_supplemental.sql
```

### 3. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # if present; otherwise create .env.local
npm run dev
```

Frontend runs at `http://localhost:8081`.

Set the API URL in `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

## Docker (backend)

The backend includes `backend/docker-compose.yml` for PostgreSQL, app, seed, Redis, and pgAdmin services.

```bash
cd backend
docker-compose up -d --build
```

> Before using Docker Compose outside local development, replace default credentials/secrets and review ports, volumes, and CORS/public URL settings.

## Environment variables

### Frontend

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL used by frontend API calls | `http://localhost:8080` |

### Backend

Backend configuration is primarily in `backend/src/main/resources/application.properties`. Common values to configure:

| Property / Env | Description |
| --- | --- |
| `spring.datasource.url` | PostgreSQL JDBC URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `app.public-base-url` | Public frontend/base URL used by backend links |

## Scripts

### Frontend (`frontend/`)

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm test           # Run tests
```

### Backend (`backend/`)

```bash
mvn spring-boot:run  # Run API locally
mvn clean package    # Build JAR
mvn test             # Run tests
```

## Deployment notes

- Set `VITE_API_URL` to the deployed backend URL before building the frontend.
- Configure SPA fallback to `index.html` for frontend deep links like `/results/:uuid`.
- Use managed PostgreSQL/Redis and proper secrets management in production.
- Review CORS, actuator exposure, security settings, and default Docker credentials before deploying publicly.

## Documentation

- Backend details: [`backend/README.md`](backend/README.md)
- Frontend details: [`frontend/README.md`](frontend/README.md)
- Project report: [`docs/Project-Report on ROI CALCULATOR.pdf`](docs/Project-Report%20on%20ROI%20CALCULATOR.pdf)

## License

No license file is currently included. Add a `LICENSE` file if you intend to distribute this project under a specific license.
