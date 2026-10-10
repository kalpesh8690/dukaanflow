# DukaanFlow API

## Setup

1. Install Node.js 20 or newer.
2. From `backend/`, run `npm install`.
3. Copy the root `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET` (32+ random characters), and `CORS_ORIGIN`.
4. Run `npm run dev`.

## Routes

- `GET /api/health` — health check
- `POST /api/auth/register` — create a business owner account
- `POST /api/auth/login` — sign in
- `GET /api/products` — list products for the authenticated business
- `POST /api/products` — create a product
- `PATCH /api/products/:id` — update a product belonging to the authenticated business
- `DELETE /api/products/:id` — delete a product belonging to the authenticated business

Send `Authorization: Bearer <token>` to product routes. Each product query is scoped to the authenticated business ID. Before public production deployment, add integration tests, audit validation and rate limits, configure HTTPS/secrets, and run a dependency/security review.
