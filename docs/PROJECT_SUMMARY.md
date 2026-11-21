# Project Summary

## Project Title

**Global Education & Career ROI Calculator**  
*A Full-Stack Education Return on Investment Analysis Platform*

## Academic Context

- **Degree programme:** Bachelor of Technology in Computer Science and Engineering
- **Institution:** Noida International University, School of Engineering and Technology, Gautam Buddha Nagar, Uttar Pradesh, India
- **Academic session:** 2022–2026
- **Project report:** [Project-Report on ROI CALCULATOR.pdf](./Project-Report%20on%20ROI%20CALCULATOR.pdf)
- **Project team (as documented in the submitted report):** Karan Sahani (BT/CS/2201/085), Minhaj Ahmad (BT/CS/2201/099), Bittu Pd Mandal (BT/CS/2201/055)
- **Project guide:** Ms. Jyoti Mahur, Assistant Professor, Department of Computer Science and Engineering

## Abstract

Pursuing higher education is a major financial decision that involves tuition fees, living expenses, opportunity costs, and uncertainty about post-graduation earnings. Students and families often lack a structured, data-driven method for comparing education pathways across countries, institutions, academic majors, and degree levels. This project presents the Global Education & Career ROI Calculator, a full-stack web platform designed to support education investment decisions through financial modelling and comparative analysis.

The system combines a React and TypeScript frontend with a Spring Boot REST API backend and PostgreSQL-based persistence. It implements ROI-related calculations that consider education costs, projected post-study income, inflation and tax assumptions, break-even analysis, and scenario comparison. The backend exposes APIs for ROI calculation, shareable results, PDF report generation, reference data, comparison, career intelligence, decision confidence, and SEO/content support. The frontend provides calculator, results, comparison, country/major exploration, and insight pages. The project demonstrates how software engineering, data modelling, and financial analysis can be integrated into a decision-support platform for global education planning.

## Problem Statement

Higher education can represent a substantial long-term investment. However, prospective students typically evaluate options using fragmented information such as tuition fees, rankings, or anecdotal salary expectations. This makes it difficult to estimate total cost, opportunity cost, expected earnings, break-even period, and overall return on investment. The project addresses the need for a structured platform that helps users compare education pathways using consistent financial assumptions and accessible visual outputs.

## Objectives

The objectives documented in the submitted project report include:

- Designing and implementing a multi-variable education ROI computation engine using financial formulas and precise arithmetic.
- Building a layered Spring Boot REST API with clear separation between controllers, services, repositories, DTOs, and entities.
- Persisting calculation and reference data in PostgreSQL with support for shareable calculation results.
- Supporting reference data for countries, currencies, majors, degree levels, universities, and related financial inputs.
- Providing comparison and decision-support functionality for evaluating education pathways.
- Implementing supporting modules such as SEO content endpoints, monetisation-ready data structures, and deployment configuration.
- Applying security, validation, and production-oriented engineering practices appropriate for a scalable backend system.

## Methodology and System Architecture

The project follows a layered full-stack architecture:

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Axios, Recharts, Framer Motion, and i18next.
- **Backend API:** Spring Boot 3.2 on Java 17, exposing REST endpoints under `/api/v1`.
- **Business logic:** Service-layer components for ROI calculation, simulation, comparison, career intelligence, decision confidence, degree-worth-it insights, SEO, and report generation.
- **Data access:** Spring Data JPA repositories with Hibernate and PostgreSQL.
- **Persistence:** PostgreSQL as the primary relational database; Redis dependencies/configuration are present as optional caching support.
- **Deployment support:** Dockerfile, Docker Compose, and Spring Actuator/OpenAPI configuration.

The calculation workflow accepts user inputs, retrieves reference data where needed, applies financial calculations, persists/shareable results where applicable, and returns structured responses for frontend visualisation or PDF export.

## Main Implementation Details

The current repository contains implementations for:

- ROI calculation, quick estimate, shareable result retrieval, and simulation endpoints.
- Comparison of education options.
- Reference-data APIs for countries, majors, degree levels, universities, and currencies.
- SEO page endpoints and SEO-related entities.
- PDF ROI report generation.
- Career intelligence, decision confidence, and degree-worth-it insight endpoints.
- Frontend routes for calculator, results, comparison, countries, majors, insights, SEO pages, blog pages, and legal pages.

Some capabilities described in the report are architectural targets, proposed extensions, or deployment-oriented plans and should not be interpreted as fully validated production outcomes.

## Technologies Used

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, React Router, TanStack Query, Axios, Recharts, Framer Motion, i18next |
| Backend | Java 17, Spring Boot 3.2, Spring Web, Spring Data JPA, Hibernate, Validation, Security, Actuator, Cache |
| Database | PostgreSQL, H2 for tests, Redis optional dependency |
| Documentation/Tools | Springdoc OpenAPI, Maven, Docker, Docker Compose, Vitest, ESLint |
| Reporting | OpenPDF |

## Limitations and Conclusion

The project report identifies limitations including static or periodically updated data dependencies, absence of live exchange-rate integration in the baseline design, limited authentication/premium-user features, and the need for further production hardening and validation. Future work includes live data integrations, machine-learning salary prediction, stronger authentication, broader data coverage, and production deployment improvements.

The Global Education & Career ROI Calculator demonstrates a practical application of full-stack software engineering to an education finance decision problem. It provides a structured foundation for evaluating education investments while clearly separating implemented functionality from future enhancements.

## Complete Project Report

The full submitted academic report is available here: [Project-Report on ROI CALCULATOR.pdf](./Project-Report%20on%20ROI%20CALCULATOR.pdf).
