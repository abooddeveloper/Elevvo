# Express TypeScript API

An in-memory users API with separate route, controller, and service layers.

## Run

```sh
npm install
npm run dev
```

The server listens on port `3000` by default; set `PORT` to override it. Use `npm run build` to compile and `npm start` to run the compiled server.

## Endpoints

- `GET /api/users` lists users.
- `GET /api/users/:id` fetches one user.
- `POST /api/users` creates a user from JSON containing `name` and `email`.
- `PUT /api/users/:id` replaces a user's `name` and `email`.
- `DELETE /api/users/:id` removes a user.

The observability middleware logs one JSON record per completed request with its ISO timestamp, HTTP method, URL path, and duration in milliseconds. Data is held in memory and resets when the server restarts.