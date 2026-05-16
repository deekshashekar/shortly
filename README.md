# shortly

A URL shortener API built with Express, Prisma, and Neon Postgres.

## Endpoints

### `POST /links`

Creates a short link for the given URL.

**Request body**
```json
{ "url": "https://example.com" }
```

**Response**
```json
{ "code": "abc123" }
```

| Status | When |
|--------|------|
| 200 | Link created successfully |
| 400 | `url` is missing or not a valid URL |
| 409 | Generated code already exists (rare) |
| 500 | Unexpected server error |

---

### `GET /:code`

Redirects to the original URL for the given short code.

| Status | When |
|--------|------|
| 302 | Code found — redirects to the original URL |
| 404 | Code does not exist |
| 500 | Unexpected server error |
