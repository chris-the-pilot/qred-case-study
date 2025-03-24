# Qred Case Study – Task 2 Implementation

This project is a backend service built in Node.js, developed as part of the Qred case study. It simulates a simplified credit card backend that connects to external systems, exposes APIs for card-related data, and adheres to industry security standards.

# Assumptions

- Company and user data is provided by another service
- The “Contact Qred” functionality is handled by a separate team.
- There is a single user role; both admins and employees view the same card/account data.
- The future auth token includes a company_id, which is used to retrieve card account information. The auth token however is not implemented in the current solution.
- The credit card limit is tied to the company account (card account), even if multiple cards exist.
- All development complies with PCI-DSS and GDPR standards.

# Recommended Reading Path

For the best understanding of the system, follow this path:

1. Start with docs/architecture.md; High-level overview of the architecture, key components, and data flow.
2. Review openAPI.yaml; Explore the API structure, endpoints, request/response formats.
3. Explore the service/ folder; Dive into the actual Lambda function code and core logic.
4. Finish with docs/future-improvements.md; Understand potential areas for system growth or refinement.

# Running Locally

## Requirements

- NodeJS v22+
- Docker
- AWS SAM CLI

## Steps

1. Navigate to the service/ directory and install dependencies: `npm install`
2. Create .env file with: `POSTGRES_USER=dev_user
POSTGRES_PASSWORD=dev_pass123
POSTGRES_DB=dev_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://dev_user:dev_pass123@localhost:5432/dev_db?schema=public"`
3. Run the DB containers: `docker-compose up`
4. Generate the Prisma Client: `npx prisma generate`
5. Push the schema to the database: `npx prisma db push`
6. Seed the database: `npx prisma db seed`
7. Convert .ts files to .js for SAM support: `npm run watch`
8. Copy node_modules into the dist/ directory: `cp -R node_modules dist/node_modules`
9. Run the service locally using AWS SAM: `npm run local`
10. Once running, access the APIs via: `http://localhost:3000`

## Running Tests

1. To run the unit tests: `npm run test`
