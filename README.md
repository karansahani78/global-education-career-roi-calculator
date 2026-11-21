# Global Education & Career ROI Calculator

> This repository contains the full project: **backend** (Spring Boot API), **frontend** (React/Vite app), and **docs**.  
> The detailed backend documentation is below for quick visibility when opening the repo.

## Repository Layout

| Path | Description |
| --- | --- |
| [`backend/`](backend/) | Spring Boot 3.2 / Java 17 REST API, PostgreSQL, Docker, seed data |
| [`frontend/`](frontend/) | React 18 + TypeScript + Vite UI |
| [`docs/`](docs/) | Project report and documentation assets |

**Quick start:** run backend from `backend/` and frontend from `frontend/`. See [`frontend/README.md`](frontend/README.md) for frontend-specific commands.

---

# 🎓 Global Education & Career ROI Calculator - Backend

> **Production-Ready, Million-Dollar SaaS Backend**  
> Calculate Return on Investment for Education Worldwide

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Monetization Strategy](#monetization-strategy)
- [SEO Strategy](#seo-strategy)
- [Scaling](#scaling)

---

## 🌟 Overview

A globally-scalable RESTful backend for calculating education ROI across:
- **195+ countries**
- **1000+ universities**
- **500+ majors/fields of study**
- **Multiple degree levels** (Bachelor's, Master's, PhD, etc.)
- **150+ currencies** with real-time exchange rates

### Key Metrics Target
- **1M+ monthly users**
- **$10K+ monthly AdSense revenue**
- **$50K+ annual affiliate revenue**
- **10K+ leads per month**

---

## ✨ Features

### Core Functionality
- ✅ **ROI Calculation Engine** - Comprehensive financial calculations
- ✅ **Multi-Currency Support** - Convert between 150+ currencies
- ✅ **Comparison Tool** - Compare countries, universities, majors
- ✅ **Shareable Results** - UUID-based shareable calculation links
- ✅ **Historical Data** - Track and analyze calculation trends

### Programmatic SEO
- ✅ **Dynamic SEO Pages** - `/roi/{country}/{major}` patterns
- ✅ **Metadata Generation** - Auto-generate titles, descriptions
- ✅ **FAQ Schema** - Structured data for rich snippets
- ✅ **Sitemap Generation** - Automatic XML sitemap
- ✅ **Pre-filled Calculators** - SEO pages with smart defaults

### Monetization Features
- ✅ **Ad Zones** - Strategic AdSense placement points
- ✅ **Affiliate Integration** - University/course recommendations
- ✅ **Lead Capture** - Email collection with user consent
- ✅ **Analytics Tracking** - Anonymous usage statistics

### Performance & Scale
- ✅ **Horizontal Scaling** - Stateless architecture
- ✅ **Caching** - Redis-ready caching layer
- ✅ **Database Indexing** - Optimized queries
- ✅ **Rate Limiting** - API protection
- ✅ **Health Checks** - Production monitoring

---

## 🛠️ Tech Stack

### Backend
- **Java 17** - Modern Java features
- **Spring Boot 3.2** - Framework
- **Spring Data JPA** - ORM layer
- **Hibernate** - JPA implementation
- **PostgreSQL 16** - Primary database
- **Redis** - Caching (optional)

### Development Tools
- **Maven** - Build tool
- **Lombok** - Reduce boilerplate
- **MapStruct** - DTO mapping
- **Swagger/OpenAPI** - API documentation

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Local development
- **AWS/GCP/Azure** - Cloud deployment ready

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Client Layer                  │
│   (Next.js, React, Mobile Apps)         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         API Gateway / CDN               │
│      (Cloudflare, AWS CloudFront)       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Spring Boot Application           │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │Controller│→ │ Service  │            │
│  └──────────┘  └──────────┘            │
│       ↓             ↓                   │
│  ┌──────────┐  ┌──────────┐            │
│  │   DTO    │  │  Entity  │            │
│  └──────────┘  └──────────┘            │
│       ↓             ↓                   │
│  └────────────────────────────┘        │
│  │   Repository (Spring Data)  │        │
│  └────────────────────────────┘        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         PostgreSQL Database              │
│      + Redis Cache (Optional)            │
└─────────────────────────────────────────┘
```

### Key Design Patterns
- **Layered Architecture** - Controller → Service → Repository
- **DTO Pattern** - Separate API contracts from entities
- **Builder Pattern** - Clean object construction
- **Repository Pattern** - Data access abstraction

---

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL 16
- Docker & Docker Compose (optional)

### Local Development (Docker)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/roi-calculator-backend.git
cd roi-calculator-backend
```

2. **Start services**
```bash
docker-compose up -d
```

3. **Access the application**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- pgAdmin: http://localhost:5050

### Manual Setup

1. **Set up PostgreSQL**
```sql
CREATE DATABASE roi_calculator_db;
CREATE USER roi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roi_calculator_db TO roi_user;
```

2. **Update application.properties**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/roi_calculator_db
spring.datasource.username=roi_user
spring.datasource.password=your_password
```

3. **Start the backend once to let Hibernate create the schema**
```bash
mvn spring-boot:run
```

4. **Load the reference data** (run both files in order; both are idempotent)
```bash
psql -U roi_user -d roi_calculator_db -f src/main/resources/db/seed_reference_data.sql
psql -U roi_user -d roi_calculator_db -f src/main/resources/db/seed_supplemental.sql
```

   The base seed provides currencies, countries, majors, universities and costs. The
   supplemental seed completes coverage: 100 majors, 889 universities, 16,219 programmes,
   242,100 salary records, loan rules and cost-of-living for every country, plus 22,781
   programmatic SEO pages with FAQs.

5. **Rebuild and run**
```bash
mvn clean install
mvn spring-boot:run
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8080/api/v1
Production: https://api.roicalculator.com/api/v1
```

### Authentication
Currently public API. JWT authentication ready for premium features.

### Core Endpoints

#### 1. Calculate ROI
```http
POST /api/v1/roi/calculate
Content-Type: application/json

{
  "countryCode": "USA",
  "majorId": 1,
  "degreeLevelId": 1,
  "tuitionAnnual": 50000,
  "livingCostAnnual": 20000,
  "durationYears": 4,
  "expectedSalaryAfter": 80000,
  "currentSalary": 40000,
  "inflationRate": 3.0,
  "taxRate": 25.0,
  "calculationYears": 10,
  "currencyCode": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "shareableUrl": "/share/550e8400-e29b-41d4-a716-446655440000",
    "inputSummary": {
      "country": "United States",
      "major": "Computer Science",
      "degreeLevel": "Bachelor's",
      "durationYears": 4,
      "currencyCode": "USD",
      "currencySymbol": "$"
    },
    "costBreakdown": {
      "tuitionTotal": 200000.00,
      "livingCostTotal": 80000.00,
      "totalEducationCost": 280000.00,
      "opportunityCost": 160000.00,
      "totalInvestment": 440000.00
    },
    "roiResults": {
      "netRoi": 360000.00,
      "roiPercentage": 81.82,
      "breakEvenYears": 7.5,
      "annualizedReturn": 8.18,
      "verdict": "Good"
    },
    "yearlyBreakdown": [...]
  }
}
```

#### 2. Get Countries
```http
GET /api/v1/data/countries
```

#### 3. Get Majors
```http
GET /api/v1/data/majors?category=STEM
```

#### 4. Get SEO Page Data
```http
GET /api/v1/seo/pages/roi-usa-computer-science
```

### Full API Documentation
Visit **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## 🚀 Deployment

### Docker Deployment

1. **Build image**
```bash
docker build -t roi-calculator:latest .
```

2. **Run container**
```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://your-db:5432/roi_calculator_db \
  -e SPRING_DATASOURCE_USERNAME=roi_user \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  roi-calculator:latest
```

### AWS Deployment

#### Using AWS Elastic Beanstalk
```bash
# Initialize EB
eb init -p docker roi-calculator

# Create environment
eb create production-env

# Deploy
eb deploy
```

#### Using AWS ECS
1. Push image to ECR
2. Create ECS task definition
3. Create ECS service
4. Set up Application Load Balancer
5. Configure Auto Scaling

### Environment Variables (Production)
```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://rds-endpoint:5432/roi_db
SPRING_DATASOURCE_USERNAME=roi_user
SPRING_DATASOURCE_PASSWORD=<from-secrets-manager>
APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com
APP_MONETIZATION_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxx
```

---

## 💰 Monetization Strategy

### 1. Google AdSense
**Target: $10K+ monthly revenue**

- **Ad Placement Zones**:
  - Header banner (Desktop & Mobile)
  - Sidebar (Desktop)
  - Below calculator form
  - In-content (within results)
  - Footer

- **Optimization**:
  - High-traffic SEO pages
  - Sticky ads on scroll
  - Auto ads for optimal placement
  - A/B testing different layouts

- **API Integration**:
  ```json
  GET /api/v1/monetization/ad-zones
  {
    "zones": [
      {
        "name": "below_calculator",
        "type": "adsense",
        "adUnitId": "ca-pub-xxx/123456",
        "placement": "responsive"
      }
    ]
  }
  ```

### 2. Affiliate Marketing
**Target: $50K+ annual revenue**

- **University Partnerships** - Application referrals (20-30% commission)
- **Online Course Platforms** - Udemy, Coursera, edX (5-15% commission)
- **Student Services** - Accommodation, insurance, loans
- **Study Abroad Agencies** - Country-specific partners

- **API Endpoint**:
  ```json
  GET /api/v1/recommendations/country/USA/major/1
  {
    "universities": [...],
    "courses": [...],
    "affiliateProducts": [
      {
        "name": "Coursera Computer Science Specialization",
        "url": "https://affiliate-link.com",
        "commission": 15.0
      }
    ]
  }
  ```

### 3. Lead Generation
**Target: 10K+ leads/month**

- **Email Capture** - After calculation completion
- **Newsletter Signup** - Study abroad tips, scholarship alerts
- **Partner Universities** - Sell qualified leads ($50-200 per lead)
- **Career Coaching Services** - Premium consultation upsell

- **Lead API**:
  ```json
  POST /api/v1/leads/capture
  {
    "email": "student@example.com",
    "interestedIn": "Computer Science in USA",
    "calculationUuid": "550e8400-..."
  }
  ```

### 4. Premium Features (Future)
- Advanced comparison tools
- Detailed career path analysis
- Scholarship matching
- 1-on-1 counseling

---

## 🔍 SEO Strategy

### Programmatic SEO Implementation

#### Page Template Pattern
```
/roi/{country}/{major}
/roi/{country}/{degree-level}
/roi/{country}/{major}/{university}
/compare/{country-a}-vs-{country-b}/{major}
```

#### Example Pages (Auto-Generated)
- `/roi/usa/computer-science` → 200K searches/month
- `/roi/canada/mba` → 80K searches/month
- `/roi/uk/nursing` → 120K searches/month
- `/roi/australia/engineering` → 95K searches/month

#### SEO Metadata Generation
```java
@Service
public class SeoService {
    public SeoPage generatePage(Country country, Major major) {
        return SeoPage.builder()
            .slug("roi-" + country.getCode() + "-" + major.getSlug())
            .metaTitle(major.getName() + " ROI in " + country.getName() + " | Calculator")
            .metaDescription("Calculate your ROI for " + major.getName() + 
                           " in " + country.getName() + ". Get salary projections, costs, and break-even analysis.")
            .h1Title("ROI Calculator: " + major.getName() + " in " + country.getName())
            .build();
    }
}
```

#### Target Keywords
- "roi calculator for education"
- "is [major] worth it in [country]"
- "[major] salary in [country]"
- "cost of studying [major] in [country]"
- "[degree] ROI calculator"

#### Content Strategy
1. **Auto-Generated Pages**: 195 countries × 500 majors = **97,500 pages**
2. **FAQ Schema**: Rich snippets for better CTR
3. **Internal Linking**: Related majors, countries, universities
4. **Fresh Content**: Weekly blog posts about education trends

---

## 📈 Scaling Strategy

### Horizontal Scaling
- **Stateless Design** - No session state
- **Load Balancer** - Distribute traffic across multiple instances
- **Database Connection Pooling** - HikariCP configuration
- **Caching Layer** - Redis for frequently accessed data

### Performance Optimization
```properties
# Hibernate Batching
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true

# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# Caching
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
```

### Database Optimization
- **Indexing**: All foreign keys, search columns
- **Partitioning**: Calculations table by date
- **Read Replicas**: Separate read/write databases
- **Query Optimization**: Use EXPLAIN ANALYZE

### CDN Strategy
- Static assets via CloudFlare/CloudFront
- API response caching for public endpoints
- Geographic distribution

### Monitoring
- **APM**: New Relic, DataDog
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty for critical issues

---

## 📊 Analytics & Tracking

### User Analytics
```sql
-- Most popular majors
SELECT major_id, COUNT(*) as calc_count
FROM roi_calculations
GROUP BY major_id
ORDER BY calc_count DESC
LIMIT 10;

-- Traffic by country
SELECT user_country_code, COUNT(*) as visits
FROM roi_calculations
WHERE calculated_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_country_code;
```

### Conversion Tracking
- Calculator usage → Lead capture: Target 15%
- Page views → Calculation: Target 25%
- Calculation → Share: Target 10%

---

## 🔐 Security

### Implementation
- **Input Validation**: Bean Validation annotations
- **SQL Injection**: Parameterized queries (JPA)
- **CORS**: Configured for allowed origins
- **Rate Limiting**: IP-based throttling
- **HTTPS Only**: Force SSL in production
- **Secrets Management**: AWS Secrets Manager/Vault

### GDPR Compliance
- Anonymous calculations (no PII required)
- Optional email with explicit consent
- Data retention policy: 2 years
- Right to deletion endpoint

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

- **Email**: support@roicalculator.com
- **Documentation**: https://docs.roicalculator.com
- **Issues**: GitHub Issues

---

## 📄 License

Proprietary - All Rights Reserved

Copyright © 2024 ROI Calculator Inc.

---

## 🎯 Roadmap

### Phase 1 (Q1 2024) ✅
- [x] Core ROI calculation engine
- [x] Multi-currency support
- [x] Basic API endpoints
- [x] Database schema

### Phase 2 (Q2 2024)
- [ ] Programmatic SEO pages (10,000+ pages)
- [ ] Comparison tool
- [ ] Advanced analytics
- [ ] Mobile app API support

### Phase 3 (Q3 2024)
- [ ] Machine learning salary predictions
- [ ] Career path analysis
- [ ] Scholarship database integration
- [ ] Premium features

### Phase 4 (Q4 2024)
- [ ] 1M+ monthly users
- [ ] $100K+ annual revenue
- [ ] Global expansion (Asia, Latin America)
- [ ] Enterprise partnerships

---

**Built with ❤️ for students worldwide**
