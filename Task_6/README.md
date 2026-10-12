# Express TypeScript API

An Express API with PostgreSQL persistence through Prisma, password hashing, JWT authentication, and role-based access control.

## Run

```sh
npm install
npm run prisma:generate
docker compose up -d redis
npm run dev
```

The server listens on port `3000` by default; set `PORT` to override it. Environment variables are loaded from the root `.env` file with `dotenv`. Use `npm run build` to compile and `npm start` to run the compiled server.

Redis is required at startup and is available at `redis://localhost:6379` by default. Set `REDIS_URL` in the root `.env` to use another Redis instance. The Compose service persists Redis data in a named volume.

Configure `DATABASE_URL` in the root `.env` as a PostgreSQL connection string. Keep `.env` private and never commit database credentials. Replace `JWT_SECRET` with a random secret of at least 32 characters before deployment. Set `CORS_ORIGINS` to a comma-separated allowlist of exact browser origins (for example `https://app.example.com,https://admin.example.com`). The default origin is `http://localhost:3000`.

The Prisma schema is in `prisma/schema.prisma`; migration history is in `prisma/migrations`. Run `npm run prisma:migrate -- --name <migration_name>` during development to create and apply a migration. Deploy existing migrations with `npx prisma migrate deploy`.

## Endpoints

- `GET /api/products?page=1&limit=20` lists products and caches each page in Redis for one hour. Successful order creation invalidates cached pages so subsequent reads return current stock.
- `POST /api/users/register` accepts `{ "name", "email", "password", "role" }`. Passwords must be at least 12 characters; `role` must be `USER` or `ADMIN`. Public registration currently allows choosing `ADMIN`, which is unsafe for production.
- `POST /api/users/login` accepts `{ "email", "password" }` and returns a one-hour HS256 bearer token. Login is limited to five requests per IP per 15 minutes, with request counters stored centrally in Redis across API instances.
- `GET /api/users?page=1&limit=20` lists users; requires an `ADMIN` bearer token. Page size is capped at 100.
- `GET /api/users/:id` fetches the matching user's own profile; administrators can fetch any profile.
- `DELETE /api/users/:id` removes a user; requires an `ADMIN` bearer token.
- `GET /api/orders?page=1&limit=20` lists the signed-in user's orders (administrators see all), including order items and products.
- `POST /api/orders` creates an order for the signed-in user. Body: `{ "items": [{ "productId": "<uuid>", "quantity": 2 }] }`. Stock is checked and decremented in the same transaction as the nested order and item writes.

All protected requests use `Authorization: Bearer <token>`. User responses never include password hashes. Request bodies are validated with Zod. CORS allows only configured origins; requests without an `Origin` header (such as server-to-server calls) are accepted.

The observability middleware logs one JSON record per completed request with its ISO timestamp, HTTP method, URL path, and duration in milliseconds.
