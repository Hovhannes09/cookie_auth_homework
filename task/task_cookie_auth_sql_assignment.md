# Cookie Auth + SQL JOIN/UNION/FK Assignment — Standalone Node.js Mini-Project

## Overview
Build a **standalone** mini-project (a brand new Express app — **do NOT extend `express-app`**) that
demonstrates two things together:

1. **JWT authentication delivered via a signed `httpOnly` cookie** (NOT `localStorage`, NOT
   `Authorization` header). The token is signed twice — once by `jsonwebtoken` and once by
   `cookie-parser` — so the client cannot tamper with it.
2. Every SQL pattern covered in **`MySQL_notes.md`**:
   - **Self JOIN** (Customers in the same city)
   - **UNION / UNION ALL** (combining names from two tables)
   - **FOREIGN KEY** with **`ON DELETE CASCADE`** and **`ON UPDATE CASCADE`**
   - All tables created with the **InnoDB** storage engine (and the homework must explain *why*)

> The project is a small "Directory & Orders" API — auth users sign in, then manage customers,
> directory entries, persons, and orders. Each entity exists specifically to exercise one SQL
> pattern from the notes.

---

## Stack (mandatory)

| Concern               | Library                                                  |
|-----------------------|----------------------------------------------------------|
| Runtime               | Node.js 20+ (ES Modules — `"type": "module"`)            |
| HTTP framework        | Express 5                                                |
| MySQL driver          | `mysql2/promise`                                         |
| Cookies               | `cookie-parser` (signed cookies — `signed: true`)        |
| Tokens                | `jsonwebtoken`                                           |
| Password hashing      | `bcrypt`                                                 |
| Validation            | `joi`                                                    |
| Errors                | `http-errors`                                            |
| Utilities             | `lodash`                                                 |
| Logging               | `morgan`                                                 |
| Date helpers          | `moment`                                                 |
| Env                   | `dotenv`                                                 |

> Hard constraints:
> - Do **NOT** use `express-session`, `passport`, `cookie-session`, or any other session middleware.
> - Do **NOT** store the JWT in `localStorage` or send it via the `Authorization` header.
> - Do **NOT** use Sequelize / Knex / TypeORM / Prisma — write raw SQL with `?` placeholders.

---

## Project Structure (must match exactly)

```
cookie-auth-sql-app/
├── app.js
├── migrate.js
├── seed.js                     # seed data so Self JOIN / UNION are meaningful
├── .env.example
├── package.json
│
├── clients/
│   └── db.mysql.js             # mysql2/promise pool
│
├── models/
│   ├── appUsers.js             # auth users
│   ├── customers.js            # Self JOIN target
│   ├── directoryUsers.js       # UNION target
│   ├── persons.js              # FK parent
│   └── orders.js               # FK child (CASCADE)
│
├── controllers/
│   ├── auth.js
│   ├── customers.js
│   ├── names.js                # UNION endpoints
│   └── persons.js              # also exposes /orders endpoints
│
├── routes/
│   ├── index.js
│   ├── auth.js
│   ├── customers.js
│   ├── names.js
│   └── persons.js
│
└── middlewares/
    ├── authorization.js        # reads req.signedCookies.token
    ├── validation.js
    ├── errorHandler.js
    └── schemas/
        ├── auth.schema.js
        ├── customers.schema.js
        ├── persons.schema.js
        └── orders.schema.js
```

---

## Environment variables — `.env.example`

```env
PORT=3000
NODE_ENV=development

# 32+ random chars. Used by cookie-parser to sign cookies.
COOKIE_SECRET=

# 32+ random chars. Used by jsonwebtoken to sign the JWT itself.
JWT_SECRET=

# Cookie lifetime in milliseconds (default 24h)
COOKIE_MAX_AGE=86400000

MY_SQL_HOST=127.0.0.1
MY_SQL_PORT=3306
MY_SQL_USER=root
MY_SQL_PASSWORD=
MY_SQL_DATABASE=cookie_auth_sql_demo
```

The two secrets **must be different values**. `COOKIE_SECRET` protects against the client editing the
cookie envelope; `JWT_SECRET` protects the token payload itself. Reusing one secret for both defeats
the purpose of layering.

---

## Database — `migrate.js`

The migration must create the schema below using `CREATE TABLE IF NOT EXISTS`. **Every table must
explicitly use `ENGINE=InnoDB`** — this is the only engine that supports `FOREIGN KEY` (see
`MySQL_notes.md` section 3). The migration script must log a one-line success message after each
table, e.g. `-> customers table successfully created`.

```sql
-- 1. Auth users (login / register)
CREATE TABLE IF NOT EXISTS app_users (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(50)  NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Customers — used for SELF JOIN (mirrors MySQL_notes section 1)
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID   INT PRIMARY KEY AUTO_INCREMENT,
    CustomerName VARCHAR(50) NOT NULL,
    City         VARCHAR(50) NOT NULL,
    last_name    VARCHAR(50)
) ENGINE=InnoDB;

-- 3. Directory users — used for UNION (mirrors MySQL_notes section 2)
CREATE TABLE IF NOT EXISTS directory_users (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 4. Persons — FK parent (mirrors MySQL_notes section 4)
CREATE TABLE IF NOT EXISTS Persons (
    PersonID  INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName  VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 5. Orders — FK child with CASCADE on DELETE and UPDATE
CREATE TABLE IF NOT EXISTS Orders (
    OrderID     INT PRIMARY KEY AUTO_INCREMENT,
    OrderNumber INT NOT NULL,
    PersonID    INT,
    CONSTRAINT fk_orders_person
        FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
```

### `seed.js` (required)

`seed.js` must populate at least:

- 6 rows in `Customers` (use the same six Armenian names from `MySQL_notes.md` so the Self JOIN
  produces visible pairs across Երևան / Գյումրի / Վանաձոր)
- 3 rows in `directory_users` (`Արթուր`, `Անի`, `Գոռ` — note `Անի` collides with a customer name,
  which is what makes `UNION` vs `UNION ALL` observable)
- 3 rows in `Persons`
- A few rows in `Orders` referencing those persons

`npm run seed` must be runnable independently of `npm run migrate`.

---

## Cookie-based JWT auth — exact contract

### `app.js`

```js
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'dotenv/config';

import migrate from './migrate.js';
import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));   // <-- enables req.signedCookies

await migrate();

app.use(router);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
```

### Login — must set a **signed httpOnly** cookie

```js
// controllers/auth.js (login excerpt)
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

res.cookie('token', token, {
    signed:   true,                                    // cookie-parser signs the envelope
    httpOnly: true,                                    // JS in the browser can't read it
    sameSite: 'lax',                                   // sane CSRF default
    secure:   process.env.NODE_ENV === 'production',   // HTTPS only in prod
    maxAge:   Number(process.env.COOKIE_MAX_AGE),
});

res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
```

> Note: the response body must **NOT** contain the token. The cookie is the only place it lives.

### Logout — must clear the cookie

```js
res.clearCookie('token', { signed: true, httpOnly: true, sameSite: 'lax' });
res.json({ message: 'Logged out' });
```

### `middlewares/authorization.js` — must read `req.signedCookies`

```js
import jwt from 'jsonwebtoken';
import HttpErrors from 'http-errors';

export default function authorization(req, res, next) {
    try {
        const token = req.signedCookies.token;
        if (!token) throw new HttpErrors(401, 'Missing or tampered cookie');

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (e) {
        next(new HttpErrors(401, 'Invalid session'));
    }
}
```

If `cookie-parser` detects a bad signature, `req.signedCookies.token` becomes `false` (not the
original value), and the middleware must treat that as a 401 — **you must test this explicitly**
(see Testing Checklist).

---

## API Endpoints

### A. Auth (no auth middleware on register/login)

| Method | Path             | Body / Effect                                          |
|--------|------------------|--------------------------------------------------------|
| POST   | `/auth/register` | `{ name, email, password }` — bcrypt hash, insert      |
| POST   | `/auth/login`    | `{ email, password }` — verify + set signed cookie     |
| POST   | `/auth/logout`   | clear signed cookie                                    |
| GET    | `/auth/me`       | **protected** — returns the logged-in user            |

### B. Customers — **Self JOIN** (protected)

| Method | Path                       | Description                                            |
|--------|----------------------------|--------------------------------------------------------|
| POST   | `/customers`               | `{ CustomerName, City, last_name }`                    |
| GET    | `/customers`               | list all                                               |
| GET    | `/customers/same-city`     | **Self JOIN** — returns customer pairs in the same city |
| DELETE | `/customers/:id`           | delete one customer                                    |

**Required SQL for `GET /customers/same-city`** — copy the pattern from `MySQL_notes.md` §1:

```sql
SELECT A.CustomerName AS cm1,
       B.CustomerName AS cm2,
       A.City         AS c
FROM Customers A, Customers B
WHERE A.CustomerID <> B.CustomerID
  AND A.City = B.City
ORDER BY c, cm1, cm2;
```

Response shape:
```json
{
  "pairs": [
    { "cm1": "Արամ",    "cm2": "Անի",     "c": "Երևան" },
    { "cm1": "Արամ",    "cm2": "Լուսինե", "c": "Երևան" },
    { "cm1": "Անի",     "cm2": "Արամ",    "c": "Երևան" },
    ...
  ],
  "count": 8
}
```

Note that `(Արամ, Անի)` and `(Անի, Արամ)` both appear — that is the literal behavior of the
Self JOIN with `<>`. You must keep this behavior (do **not** add `A.CustomerID < B.CustomerID`),
because the goal is to reproduce the example from the notes.

### C. Names — **UNION** and **UNION ALL** (protected)

| Method | Path               | Description                                                       |
|--------|--------------------|-------------------------------------------------------------------|
| POST   | `/directory-users` | `{ name }` — insert into `directory_users`                        |
| GET    | `/names/unique`    | **UNION** of `Customers.CustomerName` + `directory_users.name`    |
| GET    | `/names/all`       | **UNION ALL** — keeps duplicates                                  |
| GET    | `/names/by-last`   | **UNION** with `AS` alias — `Customers.last_name` + `directory_users.name` |

**Required SQL** — must mirror `MySQL_notes.md` §2:

```sql
-- /names/unique
SELECT CustomerName AS name FROM Customers
UNION
SELECT name FROM directory_users
ORDER BY name;

-- /names/all
SELECT CustomerName AS name FROM Customers
UNION ALL
SELECT name FROM directory_users
ORDER BY name;

-- /names/by-last
SELECT last_name AS name FROM Customers
UNION
SELECT name FROM directory_users
ORDER BY name;
```

Response shape (same for all three):
```json
{ "names": ["Անի", "Արամ", "Արթուր", "Գոռ", ...], "count": 8 }
```

The student must include in the README a **short prose explanation** (3–5 lines) of why
`/names/unique` returns fewer rows than `/names/all`, and why `/names/by-last` returns different
values from `/names/unique`.

### D. Persons + Orders — **FOREIGN KEY with CASCADE** (protected)

| Method | Path                | Description                                                  |
|--------|---------------------|--------------------------------------------------------------|
| POST   | `/persons`          | `{ FirstName, LastName }`                                    |
| GET    | `/persons`          | list                                                         |
| PUT    | `/persons/:id`      | update `FirstName` / `LastName` (no PK change — see note)    |
| DELETE | `/persons/:id`      | delete — **ON DELETE CASCADE** must wipe related orders      |
| POST   | `/orders`           | `{ OrderNumber, PersonID }` — FK check enforced by MySQL     |
| GET    | `/orders`           | JOIN with Persons (return `OrderNumber, FirstName, LastName`)|
| DELETE | `/orders/:id`       | delete one order                                             |

**Required SQL for `GET /orders`** — mirrors `MySQL_notes.md` §4:

```sql
SELECT o.OrderID, o.OrderNumber, p.FirstName, p.LastName
FROM Orders o
JOIN Persons p ON o.PersonID = p.PersonID
ORDER BY o.OrderID;
```

**FK behavior the homework MUST demonstrate:**

1. `POST /orders` with a non-existent `PersonID` must fail. Catch the MySQL error
   `ER_NO_REFERENCED_ROW_2` (errno `1452`) and respond with `422 { errors: { PersonID: 'Person not found' } }`.
2. `DELETE /persons/:id` must succeed and **also remove every related row in `Orders`** thanks to
   `ON DELETE CASCADE`. The response must include the number of cascaded order rows that were
   present immediately before the delete:
   ```json
   { "message": "Person deleted", "cascadedOrders": 3 }
   ```
3. `PUT /persons/:id` updates `FirstName` / `LastName` only — the PK isn't editable, so
   `ON UPDATE CASCADE` does not visibly fire here. **Document this** in the README and explain
   when `ON UPDATE CASCADE` *would* fire (e.g. natural keys, or if `PersonID` were a writable
   business key).

---

## Validation (Joi)

Add one schema file per route group under `middlewares/schemas/`. Examples:

```js
// middlewares/schemas/auth.schema.js
import Joi from 'joi';

export default {
    register: Joi.object({
        name:     Joi.string().min(2).max(50).required(),
        email:    Joi.string().email().required(),
        password: Joi.string().min(6).max(128).required(),
    }),
    login: Joi.object({
        email:    Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};
```

```js
// middlewares/schemas/customers.schema.js
import Joi from 'joi';

export default {
    create: Joi.object({
        CustomerName: Joi.string().min(2).max(50).required(),
        City:         Joi.string().min(2).max(50).required(),
        last_name:    Joi.string().max(50).allow('', null),
    }),
    idParam: Joi.object({ id: Joi.number().integer().positive().required() }),
};
```

```js
// middlewares/schemas/orders.schema.js
import Joi from 'joi';

export default {
    create: Joi.object({
        OrderNumber: Joi.number().integer().min(1).required(),
        PersonID:    Joi.number().integer().positive().required(),
    }),
    idParam: Joi.object({ id: Joi.number().integer().positive().required() }),
};
```

The `validation` middleware is the same shape used in `express-app` — `validation(schema, 'body'|'query'|'params')`.

---

## Model layer rules

- All queries go through `DbMysql.query(...)` (mysql2/promise pool) with `?` placeholders.
- Each model file uses **named exports + a default export object** (same convention as `express-app/models/users.js`).
- Use `lodash` helpers (`_.head`, `_.get`, `_.isEmpty`) where applicable.
- `console.error(error)` in every `catch`; return `null` on failure.
- The Self JOIN query, the UNION queries, and the FK-aware `JOIN Persons` query must live in the
  models — controllers only consume already-mapped objects.

---

## Frontend (minimal — optional but recommended)

A single static `public/index.html` page is enough. Its purpose is purely to **prove that the JWT
travels in a cookie, not in JS**:

- Two forms (register, login) that `fetch('/auth/register', { method:'POST', credentials:'include', ... })`.
- After login, a "Who am I" button calls `fetch('/auth/me', { credentials: 'include' })`.
- Open DevTools → Application → Cookies → confirm the `token` cookie is present and marked
  `HttpOnly` and `Signed` (the value will be prefixed by `s:` once parsed). Document this in a
  screenshot in the README.

> If you skip the frontend, the testing checklist below must still be covered with `curl`
> (passing `--cookie-jar cookies.txt --cookie cookies.txt` between calls).

---

## Testing checklist

### Cookie / JWT auth
- [ ] `POST /auth/register` hashes the password with `bcrypt` (passwords in the DB are **not** plaintext).
- [ ] `POST /auth/login` returns 200 **and** a `Set-Cookie: token=...; HttpOnly; ...` header.
- [ ] The login response body does **not** include the JWT.
- [ ] `GET /auth/me` succeeds when the cookie is sent and 401s when it is missing.
- [ ] **Tampering test:** manually edit one character of the cookie value, resend the request — must 401.
- [ ] **Forgery test:** craft a JWT with a different secret, set it as the `token` cookie — must 401
  (signature mismatch at the cookie-parser layer).
- [ ] `POST /auth/logout` clears the cookie (next `GET /auth/me` 401s).

### Self JOIN
- [ ] `GET /customers/same-city` returns pairs and uses `A`/`B` aliases.
- [ ] Pairs from different cities never appear.
- [ ] `(X, Y)` and `(Y, X)` both appear (matches the notes).

### UNION
- [ ] `GET /names/unique` has fewer rows than `GET /names/all` when a duplicate name (`Անի`) exists in both tables.
- [ ] `GET /names/by-last` returns at least one value that does not appear in `GET /names/unique`.

### FOREIGN KEY / CASCADE / InnoDB
- [ ] `POST /orders` with a non-existent `PersonID` returns 422 (caught from MySQL errno 1452).
- [ ] `DELETE /persons/:id` cascades — all matching orders disappear in the same request.
- [ ] The migration must fail loudly if the database engine is not InnoDB. Add a sanity check
  inside `migrate.js` after creation:
  ```sql
  SELECT TABLE_NAME, ENGINE
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE();
  ```
  and `console.assert` that every row has `ENGINE = 'InnoDB'`.

### Security
- [ ] `COOKIE_SECRET` and `JWT_SECRET` are different and loaded from `.env`.
- [ ] All protected routes are gated by the `authorization` middleware (write a quick grep:
      `grep -L authorization routes/*.js` should only show `auth.js` and `index.js`).
- [ ] All SQL uses prepared statements (`?`) — no string concatenation, no template literals
      containing user input.

---

## Submission

1. A zip / pull request of the new `cookie-auth-sql-app/` project (NOT a fork of `express-app`).
2. A `README.md` that contains:
   - How to run (`npm i`, `npm run migrate`, `npm run seed`, `npm run dev`)
   - A **screenshot** of DevTools → Application → Cookies showing the `HttpOnly` + signed `token` cookie
   - A 3–5 line explanation of UNION vs UNION ALL based on this app's data
   - A 3–5 line explanation of `ON DELETE CASCADE` vs `ON UPDATE CASCADE`, using `Persons` / `Orders` as the example
   - A short paragraph: "Why InnoDB?" (must reference FK support and ACID, per `MySQL_notes.md` §3)
3. A Postman / Insomnia collection (or `curl` script) that:
   - registers a user
   - logs in (saves the cookie)
   - hits every endpoint listed above
   - logs out
4. `.env.example` checked in. **Never** check in `.env`.

---

## Evaluation criteria

| Area                                          | Weight |
|-----------------------------------------------|:------:|
| Cookie-based JWT auth (signed, httpOnly, tamper-safe, logout clears) | 25%    |
| SQL correctness — Self JOIN exactly matches the notes pattern        | 15%    |
| SQL correctness — UNION vs UNION ALL behavior shown end-to-end       | 15%    |
| SQL correctness — FK + ON DELETE CASCADE demonstrated programmatically | 15%    |
| InnoDB chosen explicitly and the README explains why                  | 5%     |
| Validation (Joi for body / params), proper 4xx vs 5xx                | 10%    |
| Architectural compliance (ESM, models/controllers/routes/middlewares, no ORM, no `localStorage`, no `Authorization` header) | 10% |
| Code quality (prepared statements everywhere, `_.head`/`_.get`, consistent error handling) | 5% |

---

## Hints

- `cookie-parser` exposes signed cookies under `req.signedCookies`, **not** `req.cookies`. If you
  ever see your cookie value appear in `req.cookies` instead, it means you forgot `signed: true`
  when setting it.
- A tampered signed cookie comes through as `false` (boolean) — `if (!token)` handles this naturally.
- When testing with `curl`, use a cookie jar:
  ```bash
  curl -c jar.txt -b jar.txt -H 'Content-Type: application/json' \
       -d '{"email":"a@b.c","password":"123456"}' \
       http://localhost:3000/auth/login

  curl -b jar.txt http://localhost:3000/auth/me
  ```
- MySQL FK violation is errno **1452** (`ER_NO_REFERENCED_ROW_2`). Read `err.errno` in your catch
  block — do **not** parse `err.message`.
- The Self JOIN in `MySQL_notes.md` uses comma-join syntax (`FROM Customers A, Customers B WHERE ...`).
  Keep it that way in the homework — it is the exact pattern being taught. Rewriting it as
  `INNER JOIN ... ON ...` is fine in production code but not for this assignment.

---

**Good luck! The goal here is not "build a big app" — it is to wire a *small* app end-to-end so
that every concept from `MySQL_notes.md` is exercised on real data, and so that auth survives a
cookie-tampering attempt.** 🍪🔐
