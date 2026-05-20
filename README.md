# BeyondEmbeddings

> A full-stack personal research blog built with **React + Vite** (frontend) and **Node.js + Express + Prisma** (backend). Covers AI research, experiments, papers, and real-time chat — all managed through a custom CMS.

---

## 📁 Project Structure

```
Beyond Embeddings/
├── Beyond_backend/           # Node.js Express Backend
│   ├── prisma/               # Database schema & migrations
│   │   ├── schema.prisma     # Data models (User, Post, Comment)
│   │   ├── seed.js           # Initial data seeder (creates admin + sample post)
│   │   └── migrations/       # Auto-generated SQL migration files
│   ├── src/
│   │   ├── app.js            # Express app (middlewares, routes, error handler)
│   │   ├── server.js         # HTTP server entry point
│   │   ├── config/           # Database connection (Prisma singleton)
│   │   ├── controllers/      # HTTP request handlers (auth, posts, comments)
│   │   ├── services/         # Business logic layer (auth, posts, comments)
│   │   ├── routes/           # API route definitions
│   │   ├── middlewares/      # JWT auth guard, file upload handler
│   │   ├── clients/          # External service clients (future)
│   │   ├── constants/        # App-wide constants (future)
│   │   ├── events/           # Event emitters (future)
│   │   ├── models/           # Model helpers (future)
│   │   ├── queues/           # Background job queues (future)
│   │   ├── sockets/          # WebSocket handlers (future)
│   │   ├── storage/          # File storage adapters (future)
│   │   ├── utils/            # Shared utilities (future)
│   │   └── validators/       # Request validation schemas (future)
│   ├── uploads/              # Uploaded images (git-ignored)
│   ├── .env.example          # Environment variable template
│   ├── .gitignore            # Backend-specific git ignores
│   └── package.json          # Backend dependencies & scripts
│
├── src/                      # React Frontend (Vite)
│   ├── components/           # Reusable UI components (Navbar, Footer, Hero, ArticleCard)
│   ├── pages/                # Page-level components (Home, Blogs, Post, Admin, etc.)
│   ├── context/              # React Context providers (Auth, Content)
│   ├── data/                 # Static data files
│   ├── utils/                # Frontend utility functions
│   └── assets/               # Frontend assets (SVGs, etc.)
│
├── public/                   # Static files served by Vite
│   ├── assets/               # Images, logos, diagrams
│   └── content/              # Markdown blog post files
│
├── docs/                     # Project documentation
│   └── FUNCTIONALITY.md      # Detailed feature documentation
│
├── .github/workflows/        # CI/CD pipeline configuration
│   └── main.yml              # GitHub Actions workflow
│
├── vite.config.js            # Vite config with API proxy
├── package.json              # Frontend dependencies
├── eslint.config.js          # ESLint configuration
├── POSTING_GUIDE.md          # How to publish new blog posts
└── README.md                 # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Tool       | Version  | Check Command        |
|------------|----------|----------------------|
| Node.js    | ≥ 18.x   | `node --version`     |
| npm        | ≥ 9.x    | `npm --version`      |
| PostgreSQL | ≥ 14.x   | `psql --version`     |

### Step 1: Clone the Repository

```bash
git clone https://github.com/Viv-19/Beyond-Embeddings.git
cd Beyond-Embeddings
```

### Step 2: Set Up the Database

Create a PostgreSQL database:

```sql
-- Open psql or pgAdmin and run:
CREATE DATABASE beyond_embeddings;
```

### Step 3: Configure the Backend

```bash
# Navigate to the backend directory
cd Beyond_backend

# Copy the environment template
cp .env.example .env

# Edit .env with your actual database credentials:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/beyond_embeddings?schema=public"
# JWT_SECRET="generate_a_random_64_char_string"

# Install backend dependencies
npm install

# Generate the Prisma client (creates type-safe database queries)
npx prisma generate

# Run database migrations (creates the tables)
npx prisma migrate dev --name init

# Seed the database with an admin user and sample post
npm run seed
```

> **📝 Default Admin Credentials (created by seed):**
> - Email: 
> - Password: 
> - ⚠️ **Change this password after first login!**

### Step 4: Configure the Frontend

```bash
# Navigate back to the project root
cd ..

# Install frontend dependencies
npm install
```

### Step 5: Run the Application

You need **two terminal windows** — one for the backend, one for the frontend:

**Terminal 1 — Backend:**
```bash
cd Beyond_backend
npm run dev
# Server starts on http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
# From the project root
npm run dev
# Frontend starts on http://localhost:5173
```

### Step 6: Open the Application

Open your browser and go to: **http://localhost:5173**

- The homepage shows your latest research blog posts
- Visit `/admin` to log in and manage content
- Visit `/login` to create a reader account (for commenting)

---

## 🔧 Available Scripts

### Backend (`Beyond_backend/`)

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start backend with hot-reload (nodemon)          |
| `npm start`            | Start backend in production mode                 |
| `npm run prisma:migrate` | Run database migrations                        |
| `npm run prisma:generate` | Regenerate Prisma client                      |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser)          |
| `npm run seed`         | Seed database with admin user + sample post      |

### Frontend (project root)

| Command         | Description                                |
|-----------------|--------------------------------------------|
| `npm run dev`   | Start Vite dev server with HMR             |
| `npm run build` | Build for production                       |
| `npm run lint`  | Run ESLint                                 |
| `npm run preview` | Preview production build locally         |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint               | Auth     | Description                          |
|--------|------------------------|----------|--------------------------------------|
| POST   | `/api/auth/signup`     | Public   | Register a new user account          |
| POST   | `/api/auth/login`      | Public   | Log in and receive JWT token         |
| POST   | `/api/auth/admin-login`| Public   | Log in as admin (role verified)      |
| GET    | `/api/auth/me`         | JWT      | Get current user profile             |

### Posts

| Method | Endpoint                  | Auth        | Description                       |
|--------|---------------------------|-------------|-----------------------------------|
| GET    | `/api/posts`              | Public      | List all posts (?type= filter)    |
| GET    | `/api/posts/:slug`        | Public      | Get single post with comments     |
| POST   | `/api/posts`              | Admin       | Create a new post                 |
| DELETE | `/api/posts/:id`          | Admin       | Delete a post                     |
| PATCH  | `/api/posts/:id/views`    | Public      | Increment view count              |
| PATCH  | `/api/posts/:id/likes`    | JWT         | Increment like count              |

### Comments

| Method | Endpoint                  | Auth        | Description                       |
|--------|---------------------------|-------------|-----------------------------------|
| GET    | `/api/comments/:postId`   | Public      | List comments for a post          |
| POST   | `/api/comments`           | JWT         | Create a new comment              |
| DELETE | `/api/comments/:id`       | JWT/Admin   | Delete a comment (owner or admin) |

### Health

| Method | Endpoint     | Description                  |
|--------|-------------|------------------------------|
| GET    | `/health`   | Backend health check         |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                  │
│   Home → Blogs → Post → Chat → Experiments → Papers     │
│   Admin CMS → Create/Delete Posts                        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (Vite Proxy → localhost:3000)
┌────────────────────────▼────────────────────────────────┐
│              NODE.JS BACKEND (Express)                    │
│                                                          │
│   Routes → Controllers → Services → Prisma → PostgreSQL │
│                                                          │
│   Middlewares: JWT Auth, File Upload (Multer)            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  POSTGRESQL DATABASE                      │
│   Tables: User, Post, Comment                            │
│   Managed by: Prisma ORM                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer      | Technology                      | Purpose                                  |
|------------|---------------------------------|------------------------------------------|
| Frontend   | React 19 + Vite 7               | UI rendering, client-side routing        |
| Styling    | Vanilla CSS + Google Fonts       | Academic-themed design system            |
| Markdown   | react-markdown + KaTeX           | LaTeX math rendering in blog posts       |
| Backend    | Node.js + Express 5             | REST API server                          |
| Database   | PostgreSQL + Prisma ORM         | Data persistence with type-safe queries  |
| Auth       | JWT + bcryptjs                  | Stateless authentication                 |
| Uploads    | Multer                          | Image file upload handling               |
| DevTools   | Nodemon, ESLint                 | Hot-reload, code quality                 |
| CI/CD      | GitHub Actions                  | Automated testing and linting            |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*Built by [Vivesh Kumar Singh](https://github.com/Viv-19) — AI Researcher & Engineer*
