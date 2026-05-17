# BeyondEmbeddings — Functionality & Features

> Complete documentation of every feature in the BeyondEmbeddings research blog platform.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Content Management System (CMS)](#2-content-management-system-cms)
- [3. Blog Posts](#3-blog-posts)
- [4. Chat / Notes Feed](#4-chat--notes-feed)
- [5. Experiments & Papers](#5-experiments--papers)
- [6. User Authentication](#6-user-authentication)
- [7. Commenting System](#7-commenting-system)
- [8. Engagement Metrics](#8-engagement-metrics)
- [9. Search & Discovery](#9-search--discovery)
- [10. Static Pages](#10-static-pages)
- [11. Architecture Decisions](#11-architecture-decisions)

---

## 1. Overview

BeyondEmbeddings is a **personal research blog** designed for publishing AI research, experiments, paper reviews, and informal notes. It is built as a full-stack application with:

- **Frontend**: React SPA with client-side routing, Markdown rendering, and LaTeX support
- **Backend**: RESTful API with JWT authentication, PostgreSQL database, and Prisma ORM
- **CMS**: Admin panel for creating and managing all content types

The application supports **four content types**, each with its own dedicated page and creation flow:

| Content Type | Description | URL |
|-------------|-------------|-----|
| **Blogs** | Long-form research articles with Markdown + LaTeX | `/blogs` |
| **Notes / Chat** | Short-form thoughts, social-media-style feed | `/notes` |
| **Experiments** | Code experiments with GitHub repo links | `/experiments` |
| **Papers** | Academic paper reviews with PDF download links | `/papers` |

---

## 2. Content Management System (CMS)

### Access
- **URL**: `/admin`
- **Authentication**: Server-side via `POST /api/auth/admin-login`
- **Authorization**: Only users with `role: "admin"` in the database can access

### Features
- **Tabbed Interface**: Switch between Blogs, Chat, Experiments, and Papers
- **Create New**: Rich form with fields specific to each content type
- **Delete**: Remove any post (cascade-deletes associated comments)
- **Real-time Sync**: After any change, content is re-fetched from the API

### Content Type-Specific Fields

| Field | Blogs | Chat | Experiments | Papers |
|-------|-------|------|-------------|--------|
| Title | ✅ Required | ❌ | ✅ Required | ✅ Required |
| Slug | ✅ Required | ❌ | ✅ Required | ✅ Required |
| Body (Markdown) | ✅ | ✅ Required | ✅ | ✅ |
| Thumbnail Image | ✅ | ❌ | ✅ | ✅ |
| Excerpt | ✅ | ❌ | ✅ | ✅ |
| Read Time | ✅ | ❌ | ✅ | ✅ |
| Repo Link | ❌ | ❌ | ✅ | ❌ |
| PDF URL | ❌ | ❌ | ❌ | ✅ |

---

## 3. Blog Posts

### Viewing
- **List View**: `/blogs` — Shows all blog posts as cards (newest first)
- **Detail View**: `/post/:slug` — Full article with Markdown rendering

### Markdown Features
- Standard Markdown (headings, lists, code blocks, links, images)
- **LaTeX Math**: Inline `$E = mc^2$` and display `$$ \int_0^1 f(x) dx $$`
- **Syntax Highlighting**: Code blocks with language detection
- **Image Support**: Reference images from `/assets/diagrams/`

### Static Content Fallback
Blog content can come from two sources:
1. **Database**: Stored in the `body` field of the Post model
2. **Static Files**: Markdown files in `public/content/` (loaded by slug)

The system checks the database first, then falls back to static files.

---

## 4. Chat / Notes Feed

A social-media-style feed (inspired by Substack Notes / Instagram):

- **Verified Author Badge**: Posts show "Vivesh Kumar Singh ✓"
- **Like Button**: Heart icon with counter (requires login)
- **Comment System**: Threaded comments below each note (requires login)
- **Share Menu**: Copy link, Share to X
- **Markdown Support**: Notes render full Markdown including LaTeX

---

## 5. Experiments & Papers

### Experiments
- Research code experiments with full article bodies
- **GitHub Repository Link**: Clickable button to view source code
- Displayed with the same card layout as blog posts

### Papers
- Academic paper reviews and summaries
- **PDF Download Link**: Clickable button to download the paper
- Ideal for annotating arXiv papers or conference proceedings

---

## 6. User Authentication

### Two Authentication Tiers

| Tier | Access | How to Create |
|------|--------|---------------|
| **Reader** | View all content, post comments, like posts | Self-registration via `/login` |
| **Admin** | Full CMS access (create/delete posts) | Database seed or manual DB entry |

### Authentication Flow

```
User enters credentials
    ↓
Frontend sends POST /api/auth/login
    ↓
Backend: bcrypt.compare(password, hash)
    ↓
If match: Generate JWT token (7-day expiry)
    ↓
Frontend stores token in localStorage
    ↓
Subsequent requests include: Authorization: Bearer <token>
    ↓
Backend: jwt.verify(token) → extracts userId & role
```

### Security Features
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with a secret key, 7-day expiry
- **User Enumeration Prevention**: Same error message for "user not found" and "wrong password"
- **Role-Based Access Control**: Admin endpoints check both JWT validity and role
- **No Sensitive Data in JWT Payload**: Only userId and role are encoded

---

## 7. Commenting System

- **Who Can Comment**: Any registered and logged-in user
- **Where**: Currently on Chat/Notes posts (extensible to all types)
- **Display**: Comments show author username and timestamp
- **Deletion**: Comment author or admin can delete
- **Cascade**: Deleting a post auto-deletes all its comments

---

## 8. Engagement Metrics

| Metric | How It Works | Auth Required |
|--------|-------------|---------------|
| **Views** | Auto-incremented when a post page is opened | No |
| **Likes** | Incremented when a user clicks the heart button | Yes (logged in) |
| **Comments** | Count displayed on post cards | No (to view), Yes (to post) |

All metrics use **atomic database operations** (Prisma `increment`) to prevent race conditions when multiple users interact simultaneously.

---

## 9. Search & Discovery

### Homepage
- **Featured Post**: The most recent blog post is highlighted as a hero section
- **Latest Research**: Remaining posts shown in a vertical list

### Navigation
- **Navbar**: Links to Home, Blogs, Chat, Experiments, Papers, About
- **Post Cards**: Clickable cards with thumbnail, title, excerpt, date, and read time

---

## 10. Static Pages

| Page | URL | Content |
|------|-----|---------|
| **About** | `/about` | Author bio with photo, research focus, and work history |
| **Privacy** | `/privacy` | Privacy policy (no data collection) |
| **Terms** | `/terms` | Terms of service (CC-BY attribution for code) |

---

## 11. Architecture Decisions

### Why Separate Backend and Frontend?
- **Security**: Passwords and JWT secrets never touch the browser
- **Persistence**: Data survives browser clears, accessible from any device
- **Scalability**: Backend can be deployed independently, add caching, etc.
- **API-First**: The same API could power a mobile app in the future

### Why PostgreSQL + Prisma?
- **PostgreSQL**: Production-grade, handles complex queries, supports UUID natively
- **Prisma**: Type-safe queries, auto-generated migrations, visual database browser

### Why JWT (not Sessions)?
- **Stateless**: Backend doesn't need to store session data
- **Scalable**: Works across multiple server instances without shared session storage
- **Simple**: No need for Redis or session middleware

### Why Single Table Inheritance for Posts?
Instead of separate tables for blogs, experiments, papers, and notes, we use ONE `Post` table with a `type` column:
- **Simpler queries**: One service handles all content types
- **Unified API**: One endpoint (`GET /api/posts?type=blogs`) serves all types
- **Easier admin**: One CMS interface manages everything
- **Flexible**: Adding a new content type = adding a new `type` value

---

*Last updated: May 2026*
