# Portfolio and Blog API

This API manages portfolio projects, blog posts, comments, accounts, and contact messages.

Live API: `REPLACE_WITH_YOUR_HTTPS_API_URL`
Front-end origin: `http://localhost:5173`

## Run locally

1. Install the LTS Node.js version recorded in `.node-version`.
2. Run `npm ci` in the project folder.
3. Copy `.env.example` to `.env` using your editor.
4. Fill in the private database URI and JWT secret.
5. Use `CLIENT_ORIGIN=http://localhost:5173` and `TRUST_PROXY=0` locally.
6. Run `npm run dev`, or `npm start` without file watching.
7. Open `http://localhost:3000/health`.

## Settings

`MONGO_URI`: Atlas URI targeting `portfolio_blog`.
`JWT_SECRET`: A long random signing secret; keep it private.
`CLIENT_ORIGIN`: Exact front-end origin, with no trailing slash.
`TRUST_PROXY`: `0` locally; `1` for the single-proxy hosting setup used in this lab.
`PORT`: `3000` locally; the hosting service supplies its own value.
`NODE_ENV`: `production` on the hosting service.

Keep `.env`, `node_modules`, hashes, and tokens out of source submissions.
Keep `package.json` and `package-lock.json`.

## API requests

Send JSON with `Content-Type: application/json`.

For protected routes, send `Authorization: Bearer YOUR_TOKEN`.
Replace `:id`, `:postId`, and `:commentId` with real saved IDs.
Every `/api/blog` path also works under `/api/posts`.

| Method and path | Input | Access |
| --- | --- | --- |
| GET /health | None | Public; 200 when database responds |
| GET /api/blog | None | Public |
| GET /api/blog/:id | ID | Public; includes comments |
| POST /api/blog | title, content | Logged in; server sets author |
| PUT /api/blog/:id | title, content | Post author |
| DELETE /api/blog/:id | ID | Post author; remove comments first |
| GET /api/projects | None | Public |
| GET /api/projects/:id | ID | Public |
| POST /api/projects | title, description; optional imageUrl, repoUrl, liveUrl | Admin |
| PUT /api/projects/:id | title, description; optional links | Admin |
| DELETE /api/projects/:id | ID | Admin |
| POST /api/contact | name, email, message | Public |
| GET /api/contact | None | Admin |
| POST /api/users/register | username, email, password | Public; creates author |
| POST /api/users/login | email, password | Public; returns one-hour JWT |
| GET /api/users/me | Bearer token | Logged in |
| GET /api/blog/:postId/comments | Post ID | Public |
| POST /api/blog/:postId/comments | body | Logged in; server sets author/post |
| DELETE /api/blog/:postId/comments/:commentId | Both IDs | Comment author or post author |

## Response and permission rules

Lists return JSON arrays. Detail returns one object.
Create returns 201. Read/update returns 200. Delete returns 204 without a body.
Errors use `{ "error": { "message": "..." } }`.
400 means invalid input or ID; 401 means login is needed; 403 means permission denied.
404 means missing data/route; 409 means duplicate account or a post still has comments.
413 means body too large; 429 means too many attempts; 500 means an internal failure.
Health returns 503 when the database is unavailable.
Public author data contains only ID and username.

Post title: 3-120 characters. Content: 1-10000.
Project title: 3-120. Description: 1-2000.
Optional project links: at most 500 characters; start with `https://`.
Contact name: 1-80. Email: at most 254 with a basic email format.
Contact message: 1-2000. Comment body: 1-1000.
Username: 3-30 letters/digits/underscore; unique.
Password: at least 8 characters and at most 72 UTF-8 bytes.

Assign admin only through the trusted Atlas account, never registration input.
An admin cannot edit a different author's post.
Login/register share 10 attempts per IP per 15 minutes.
Contact allows 5 attempts per IP per 15 minutes.
JSON bodies are limited to 32 KB.
Limits use memory and reset on restart; this course deployment uses one API instance.

## Health check

`GET /health` answers the question a hosting service asks about a container: can
this process reach its database right now?

- It checks `mongoose.connection.readyState` first, then pings the database with
  `{ ping: 1 }`, the same command used in Lab 06.
- `200 { "status": "ok" }` when the ping succeeds.
- `503 { "status": "unavailable" }` when it does not.
- The response never includes the connection string, the host name, or a driver
  message, and it is sent with `Cache-Control: no-store`.

`server.js` starts the process the way a platform needs it: the port comes from
`process.env.PORT`, the socket listens on `0.0.0.0`, and `SIGTERM`/`SIGINT` close
the server and the database connection instead of leaving them dangling.

## Deployment

The API is deployed as a serverless function on **Netlify**, built from a GitHub
repository, with the data in MongoDB Atlas. The runtime version is the one
recorded in `.node-version`.

| Setting | Value |
| --- | --- |
| Repository | `https://github.com/hhx-hash/portfolio-blog-api` |
| Branch | `main` |
| Base directory | blank (this `package.json` is at the repository root) |
| Build command | `npm install` |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |
| Health check path | `/health` |
| Environment variables | `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `TRUST_PROXY=1` |

`netlify.toml` maps `/api/*`, `/health`, and `/` to the function in
`netlify/functions/api.js`. That file wraps the same Express app in
`serverless-http`, so the routes, controllers, and middleware are unchanged; only
the entry point differs from `server.js`.

Two details matter for a serverless host, and both are handled in
`lib/ensureDb.js`:

1. The Atlas connection is cached on `global` between invocations, because a warm
   instance should not open a new TLS connection per request.
2. `readyState` is checked on every request, because the platform may freeze an
   idle instance and Atlas may drop the idle socket; a cached promise alone would
   keep reporting a connection that no longer exists.

The limits in `middleware/limits.js` use process memory, so the course setup runs
one API instance and the counters reset when a fresh instance starts.

## Verified results

Local run, Node.js 22.23.2, against `portfolio_blog` on Atlas:

| Check | Result |
| --- | --- |
| `GET /health` | 200 `{"status":"ok"}`, no-store, no database detail |
| Public reads (blog list/detail, projects, comments) | 200 with arrays/objects |
| Registration, login, contact submission | 201 / 200 / 201 with the documented bodies |
| `GET /api/users/me` with and without a token | 200 / 401 |
| Blog create, update, delete as the author | 201 / 200 / 204 |
| Another author updating or deleting that post | 403 |
| Admin project CRUD; author project write | 201/200/204; 403 |
| Contact receipt for a visitor; inbox for admin only | 201; 401 / 403 without admin |
| Comment creation, public list, deletion by post author | 201 / 200 / 204 |
| Deleting a post that still has comments | 409 |
| Invalid ID / invalid JSON / missing field / 32 KB body | 400 / 400 / 400 / 413 |
| Post still present after restarting the API | present (data lives in Atlas) |
| `npm ci --omit=dev` then `npm start` (no nodemon) | starts and serves `/health` |
