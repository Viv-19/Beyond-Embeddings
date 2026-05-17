# Config

Application configuration files.

## Files

- **db.js** — Prisma Client singleton. Provides a single shared database connection
  pool used by all services throughout the application.

## 🎓 Learning

We keep configuration in a dedicated folder to centralize all external
service connections (database, cache, message queues). This makes it easy
to swap implementations (e.g., from PostgreSQL to MySQL) without touching
any business logic code.
