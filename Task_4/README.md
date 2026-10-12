# Express TypeScript API

An in-memory Express API with registration, password hashing, JWT authentication, and role-based access control.

## Run

```sh
npm install
npm run dev
```

The server listens on port `3000` by default; set `PORT` to override it. Environment variables are loaded from the root `.env` file with `dotenv`. Use `npm run build` to compile and `npm start` to run the compiled server.

The included `.env` is for local development only. Replace `JWT_SECRET` with a random secret of at least 32 characters before deployment. Set `CORS_ORIGINS` to a comma-separated allowlist of exact browser origins (for example `https://app.example.com,https://admin.example.com`). The default origin is `http://localhost:3000`. Users are held in memory and reset when the process restarts, so use a persistent database before deploying.

## Endpoints

- `POST /api/users/register` accepts `{ "name", "email", "password", "role" }`. Passwords must be at least 12 characters; `role` must be `USER` or `ADMIN`. Public registration currently allows choosing `ADMIN`, which is unsafe for production.
- `POST /api/users/login` accepts `{ "email", "password" }` and returns a one-hour HS256 bearer token. Login is limited to five requests per IP per 15 minutes.
- `GET /api/users` lists users; requires an `ADMIN` bearer token.
- `GET /api/users/:id` fetches the matching user's own profile; administrators can fetch any profile.
- `DELETE /api/users/:id` removes a user; requires an `ADMIN` bearer token.

All protected requests use `Authorization: Bearer <token>`. User responses never include password hashes. Request bodies are validated with Zod. CORS allows only configured origins; requests without an `Origin` header (such as server-to-server calls) are accepted.

The observability middleware logs one JSON record per completed request with its ISO timestamp, HTTP method, URL path, and duration in milliseconds.
