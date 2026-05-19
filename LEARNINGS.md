# What I've learned building `shortly`

## The project
A URL shortener API. You POST a URL, get a short code back, visit the code and it redirects you. Simple idea, but building it properly touched a surprising number of real concepts.

## Database (Neon + Prisma)
I started by writing raw SQL by hand in Neon's web UI — CREATE TABLE, INSERT, SELECT, UPDATE, DELETE. That part felt straightforward. Then I learned that once you bring Prisma in, you stop touching the database directly. Prisma owns the schema. You describe what you want in `schema.prisma`, run `prisma migrate dev`, and it writes the SQL for you and keeps a history of every change. If you go around Prisma and change the database manually, you get "drift" — a mismatch between what Prisma thinks exists and what actually exists. The fix is `prisma migrate reset`, which wipes and replays everything from scratch.

The Neon serverless driver (`@prisma/adapter-neon`) is just a different transport — instead of a TCP connection to Postgres, it uses HTTP/WebSockets, which is friendlier in serverless environments. The Prisma API you write is identical either way.

## Validation and error handling
Without validation, bad input crashes your server or silently stores garbage. Zod lets you describe the shape of data you expect and throws a clean error if it doesn't match. The important pattern is the central error handler in Express — a special middleware with four arguments `(err, req, res, next)` that catches anything passed to `next(err)`. Every route just calls `next(err)` and the handler sorts out the right status code. HTTP status codes that actually matter: 200 (ok), 201 (created), 400 (your fault), 401 (not logged in), 404 (not found), 409 (conflict), 500 (my fault).

## Passwords
Never store a plain password. You hash it with bcrypt, which is intentionally slow — that's the point. A fast hash is easy to brute-force. `bcrypt.hash(password, 10)` — the 10 is the cost factor, meaning it runs 2^10 rounds. The output looks like `$2b$10$xyz...` and you can never reverse it back to the original. To verify a login you run `bcrypt.compare(submitted, storedHash)` — bcrypt handles it, you never decrypt anything.

## Auth with JWT
A JWT is a signed token. When a user logs in, the server signs a payload (`{ sub: userId, email }`) with a secret key and sends it back. The client stores it and sends it in every future request as `Authorization: Bearer <token>`. The server verifies the signature — if it's valid, it trusts the payload without hitting the database. No sessions, no state on the server.

Authentication = "is this token valid and who are you?"  
Authorization = "are you allowed to do this specific thing?"  
`requireAuth` middleware handles authentication. Filtering links by `userId` is authorization.

## Code structure
Putting everything in one file works until it doesn't. Splitting into `routes/`, `services/`, and `middleware/` makes each file responsible for one thing. Services have no idea about HTTP — they just take data and return data. Routes translate HTTP into service calls. Middleware handles the pipeline. A useful test: could this code run in a CLI script with no HTTP request? If yes, it's a service.
