<div align="center">

# 🧑‍💼 Employee Management System

**A full-stack HR platform for managing employees, attendance, leave, and payroll — with separate Admin and Employee portals.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/GitHub-raza5500-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/raza5500)

</div>

---

## 🔑 Try it yourself — test accounts

> Spin up the app (or use the live demo link once deployed) and log in with either of these — no signup needed.

| Portal | Email | Password | Notes |
|---|---|---|---|
| 🛡️ **Admin** | `admin@gmail.com` | `12345678` | 🔒 Locked · Full access — manage employees, approve leave, run payroll |
| 👤 **Employee** | `employee@gmail.com` | `12345678` | 🔒 Locked · Self-service — attendance, leave requests, payslips |

> ### 🔒 These credentials can never be changed
>
> Both are **shared demo accounts**, so the app refuses to let *anyone* — including an admin editing them from the Employees page — change their **name, email or password**, or delete them. The logins above will always work.
>
> Attempts are blocked on both sides: the UI shows a **"not allowed" toast**, and the API rejects the request with **`403 Forbidden`** for anyone calling it directly.
>
> Everything else works normally — the demo employee's department, salary, bio, leave, attendance and payslips are all still fully editable.
>
> ⚠️ The forced "set your own password" prompt still applies to **real** employees an admin creates — they're provisioned with a temporary password (see [Security](#-authentication--security)). Demo accounts are exempt, since their password is fixed.

🔗 **Live App:** [employee-management-system-react-steel.vercel.app](https://employee-management-system-react-steel.vercel.app)
<!-- 🔗 **Live API:** [ems-backend-e8ie.onrender.com](https://ems-backend-e8ie.onrender.com) -->

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Authentication & Security](#-authentication--security)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🧭 Overview

Employee Management System (EMS) is a complete internal HR tool built as a **decoupled full-stack app**: a NestJS + MongoDB REST API on the backend, and a React + Vite SPA on the frontend. It models a real small-company workflow — an **Admin** who runs the organization (hiring, payroll, approvals) and **Employees** who use a self-service portal for their own day-to-day (clocking in, requesting time off, checking payslips).

Every workflow in the app is backed by real, validated API calls — there is no mock or dummy data anywhere in the client.

## 📸 Screenshots

| Dashboard | Employees |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Employees](docs/screenshots/employees.png) |

| Leave Management | Payslips |
|---|---|
| ![Leave](docs/screenshots/leave.png) | ![Payslips](docs/screenshots/payslips.png) |

| Attendance | Login Portal |
|---|---|
| ![Attendance](docs/screenshots/attendance.png) | ![Login](docs/screenshots/login.png) |

## ✨ Features

### 🛡️ Admin

- 👥 **Employee management** — create, edit, delete employee records (each creation provisions a real linked login account with a temporary password)
- 📅 **Attendance oversight** — read-only view of every employee's daily check-in/check-out history, including the time they were away
- 🗓️ **Leave approvals** — approve, reject, or reset the status of any leave request
- 💰 **Payroll** — generate, view, and delete monthly payslips per employee (with duplicate-period protection)
- 📊 **Dashboard** — live counts: total employees, departments, today's attendance, pending leave

### 👤 Employee

- ⏱️ **Attendance** — check in / check out for the day, view personal attendance history
- 🌙 **No runaway shifts** — check in, close the tab and never check out, and the day is closed for you the next time attendance is read: capped at `MAX_SHIFT_HOURS` (or midnight, whichever comes first) and flagged `auto`, instead of counting all night
- ☕ **Away** — step out mid-shift (lunch, an errand) without checking out: the clock pauses and that time is subtracted from the day's working hours. Several trips out a day are fine, and checking out while still away ends the break there rather than paying for it
- 🗓️ **Leave requests** — apply for leave, edit while still pending, track approval status
- 💵 **Payslips** — view and print your own generated payslips
- ⚙️ **Settings** — update profile info, change password
- 📊 **Dashboard** — personal stats: days present this month, pending leave, latest payslip

### 🔐 Platform-wide

- Two separate login portals (Admin / Employee) backed by one unified, role-based auth system
- Forced password reset for new employees on first login
- Fully responsive — collapsible desktop sidebar, mobile drawer navigation
- Toast notifications, inline validation, and graceful error handling throughout

## 🛠️ Tech Stack

**Frontend** (`client/`)
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- react-hot-toast, lucide-react

**Backend** (`server/`)
- NestJS 12 + Express
- MongoDB + Mongoose (via `@nestjs/mongoose`)
- JWT authentication (`@nestjs/jwt`) + `bcryptjs` password hashing
- `class-validator` / `class-transformer` for request validation
- Vitest for unit tests

**Infrastructure**
- MongoDB Atlas (database)
- Render (backend hosting)
- Vercel (frontend hosting)

## 📁 Project Structure

```
Employee-Management-System/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # fetch wrapper / API client
│       ├── context/        # AuthContext (session, role, profile)
│       ├── components/     # SideBar, forms, cards, dialogs
│       └── pages/          # Dashboard, Employees, Leave, Payslips, Attendance, Settings
│
├── server/                 # NestJS backend
│   └── src/
│       ├── auth/           # login/register, JWT guard, roles guard
│       ├── user/           # base user accounts
│       ├── employee/       # employee profiles (linked to user accounts)
│       ├── leave/          # leave requests
│       ├── payslip/        # payroll
│       ├── attendance/     # check-in/check-out, away breaks
│       └── dashboard/      # aggregated stats per role
│
└── docs/screenshots/       # README assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- A MongoDB connection (local via Docker, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone the repo

```bash
git clone https://github.com/raza5500/Employee-Management-System.git
cd Employee-Management-System
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm run start:dev       # runs on http://localhost:3000
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev              # runs on http://localhost:5173
```

### 4. Create your first admin

The `/auth/register` endpoint is intentionally not linked from the UI — it's the one-time bootstrap for creating the first Admin account:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fName":"Admin","lName":"User","email":"admin@example.com","password":"yourpassword"}'
```

From there, log into the Admin portal and use **Add Employee** to create every subsequent account — each one automatically gets a linked login with a temporary password.

## 🔧 Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign the 1-hour access tokens |
| `JWT_REFRESH_SECRET` | *Optional.* Secret for the 20-day refresh tokens. Falls back to `JWT_SECRET`, but a separate value is better — it keeps the two token kinds from being swapped for one another |
| `MAX_SHIFT_HOURS` | *Optional.* Cap used when closing a day nobody checked out of. Defaults to `12` |
| `DEMO_ACCOUNT_EMAILS` | *Optional.* Comma-separated emails of the locked demo accounts. Defaults to `admin@gmail.com,employee@gmail.com` |

**`client/.env`** / **`client/.env.production`**

| Variable | Description |
|---|---|
| `BACKEND_URI` | Base URL of the backend API |
| `VITE_DEMO_ACCOUNT_EMAILS` | *Optional.* Same list as `DEMO_ACCOUNT_EMAILS`, so the UI can warn before the request goes out. Keep both in sync |

## 📡 API Overview

<details>
<summary>Click to expand endpoint list</summary>

| Group | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/profile` |
| **Users** | `GET/PATCH /users/me`, full admin CRUD at `/users/:id` |
| **Employees** | `GET/POST /employees`, `GET /employees/me`, `GET/PATCH/DELETE /employees/:id` |
| **Leave** | `GET/POST /leaves`, `PATCH/DELETE /leaves/:id` |
| **Payslips** | `GET/POST /payslips`, `GET/DELETE /payslips/:id` |
| **Attendance** | `POST /attendance/check-in`, `POST /attendance/check-out`, `POST /attendance/away`, `POST /attendance/back`, `GET /attendance/me`, `GET /attendance` |
| **Dashboard** | `GET /dashboard` — returns role-appropriate stats |

</details>

## 🔒 Authentication & Security

- **JWT** auth; the token's role claim drives both frontend route guards and backend `RolesGuard` checks
- Two tokens per session: a **1-hour access token** sent as `Authorization: Bearer …`, and a **20-day refresh token**. When a request comes back `401`, the client silently calls `POST /auth/refresh` and replays it — so a login lasts 20 days without keeping a long-lived token on every request
- Refresh tokens are **rotated and single-use**: redeeming one deletes it and issues a new pair, so a stolen copy that has already been spent is rejected. Only a SHA-256 hash of each one is stored, rows expire on their own (Mongo TTL index), and `POST /auth/logout` revokes one immediately
- Passwords hashed with `bcryptjs`; changing a password requires the current one
- New employee accounts are provisioned with a temporary password and a `mustChangePassword` flag — the app blocks all navigation with a mandatory "set your password" modal until it's changed
- Ownership checks everywhere: employees can only ever see their own leave, payslip, and attendance records — never another employee's
- Shared demo accounts are immutable: the API rejects any change to their name, email, or password — and any attempt to delete them — with `403`, whoever is signed in. The list lives in `DEMO_ACCOUNT_EMAILS` (server) / `VITE_DEMO_ACCOUNT_EMAILS` (client)

## ☁️ Deployment

| Layer | Platform | Notes |
|---|---|---|
| Database | MongoDB Atlas | Free M0 cluster |
| Backend | Render | Build: `npm install && npm run build` · Start: `npm run start:prod` |
| Frontend | Vercel | Build: `npm run build` · Output: `dist/` |

## 👤 Author

Built by **Raza**

[![GitHub](https://img.shields.io/badge/GitHub-@raza5500-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/raza5500)

<div align="center">

If you found this useful, consider giving it a ⭐ on GitHub!

</div>
