# ⚡ EventSync — MERN Stack Inter-College Event Management System

A full-stack web application built with **MongoDB + Express + React + Node.js**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free) **or** local MongoDB

### 1. Install dependencies
```bash
bash setup.sh
# OR manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env — paste your MongoDB URI:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/eventsync
```

### 3. Start development servers
```bash
bash start-dev.sh
# Backend  → http://localhost:5000
# Frontend → http://localhost:3000
```

> The database is auto-seeded with demo users, events and teams on first run.

---

## 👤 Demo Accounts

| Role      | Email                  | Password    |
|-----------|------------------------|-------------|
| Admin     | admin@eventsync.com    | admin123    |
| Organizer | meena@eventsync.com    | org123      |
| Organizer | ramesh@eventsync.com   | org123      |
| Student   | arjun@eventsync.com    | student123  |
| Student   | priya@eventsync.com    | student123  |

---

## 🔄 Approval Workflow

```
Organizer submits event
        ↓
Admin approves / rejects  (with written feedback)
        ↓
Event goes live for students
        ↓
Student registers team
        ↓
Organizer approves / rejects  (with written feedback)
        ↓
Team officially confirmed
```

---

## 📁 Project Structure

```
eventsync-mern/
├── server/
│   ├── index.js                ← Express app + MongoDB connect + seed
│   ├── .env.example            ← Environment variables template
│   ├── models/
│   │   ├── User.js             ← Mongoose User (JWT + bcrypt)
│   │   ├── Event.js            ← Event with virtual team counts
│   │   ├── Team.js             ← Team with members array
│   │   └── Notification.js     ← Per-user notifications
│   ├── routes/
│   │   ├── auth.js             ← Register, Login, Me, Profile
│   │   ├── events.js           ← CRUD + approve/reject/toggle-reg
│   │   ├── teams.js            ← Register + approve/reject
│   │   ├── notifications.js    ← Get, mark-read, delete
│   │   ├── analytics.js        ← Admin analytics aggregations
│   │   └── users.js            ← Admin user management
│   └── middleware/
│       └── auth.js             ← JWT protect + role authorize
│
├── client/
│   ├── index.html
│   ├── vite.config.js          ← Vite + /api proxy to :5000
│   └── src/
│       ├── main.jsx            ← React entry + BrowserRouter
│       ├── App.jsx             ← Routes + ProtectedRoute + pending counts
│       ├── index.css           ← Dark theme CSS variables
│       ├── api/
│       │   └── index.js        ← Axios client + all API calls
│       ├── context/
│       │   ├── AuthContext.jsx  ← Login/register/logout state
│       │   └── ToastContext.jsx ← Global toast notifications
│       ├── components/
│       │   ├── UI.jsx           ← Spinner, Avatar, Badge, Btn, Modal, etc.
│       │   ├── Layout.jsx       ← Header + Sidebar + main shell
│       │   └── EventCard.jsx    ← Reusable event card
│       └── pages/
│           ├── LoginPage.jsx    ← Sign in / register + demo login
│           ├── DashboardPage.jsx
│           ├── EventPages.jsx   ← EventsPage + MyEventsPage + EventApprovalsPage
│           ├── TeamPages.jsx    ← MyTeamsPage + TeamApprovalsPage + AllTeamsPage
│           └── OtherPages.jsx  ← AnalyticsPage + UsersPage
│
├── setup.sh                    ← Install all dependencies
├── start-dev.sh                ← Start both servers
└── README.md
```

---

## 🛠 Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Database  | MongoDB Atlas (Mongoose) |
| Backend   | Node.js + Express.js     |
| Auth      | JWT + bcryptjs           |
| Frontend  | React 18 + Vite          |
| Routing   | React Router v6          |
| HTTP      | Axios                    |
| Styling   | Pure CSS variables (dark)|

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| POST   | /api/auth/register    | Public  | Create account     |
| POST   | /api/auth/login       | Public  | Login              |
| GET    | /api/auth/me          | Private | Current user       |
| PUT    | /api/auth/profile     | Private | Update profile     |

### Events
| Method | Endpoint                       | Access             | Description             |
|--------|--------------------------------|--------------------|-------------------------|
| GET    | /api/events                    | Private            | List (role-filtered)    |
| GET    | /api/events/:id                | Private            | Get single event        |
| POST   | /api/events                    | Organizer          | Create event            |
| PUT    | /api/events/:id                | Organizer/Admin    | Update event            |
| DELETE | /api/events/:id                | Organizer/Admin    | Delete event            |
| PATCH  | /api/events/:id/approve        | Admin              | Approve event           |
| PATCH  | /api/events/:id/reject         | Admin              | Reject with reason      |
| PATCH  | /api/events/:id/toggle-reg     | Organizer/Admin    | Open/close registration |
| GET    | /api/events/:id/teams          | Private            | Teams for this event    |

### Teams
| Method | Endpoint                       | Access             | Description             |
|--------|--------------------------------|--------------------|-------------------------|
| GET    | /api/teams                     | Private            | List (role-filtered)    |
| GET    | /api/teams/:id                 | Private            | Get single team         |
| POST   | /api/teams                     | Student            | Register team           |
| PATCH  | /api/teams/:id/approve         | Organizer/Admin    | Approve team            |
| PATCH  | /api/teams/:id/reject          | Organizer/Admin    | Reject with reason      |
| DELETE | /api/teams/:id                 | Organizer/Admin    | Remove team             |

### Other
| Method | Endpoint                        | Access  | Description             |
|--------|---------------------------------|---------|-------------------------|
| GET    | /api/notifications              | Private | User notifications      |
| PATCH  | /api/notifications/read-all     | Private | Mark all read           |
| DELETE | /api/notifications/:id          | Private | Delete notification     |
| GET    | /api/analytics                  | Admin   | Platform analytics      |
| GET    | /api/users                      | Admin   | All users               |
| DELETE | /api/users/:id                  | Admin   | Delete user             |

---

## 🌐 MongoDB Atlas Setup (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0)
3. Create a database user (remember credentials)
4. Whitelist IP: `0.0.0.0/0` (allow all) for development
5. Click **Connect** → **Connect your application** → copy the URI
6. Paste into `server/.env` as `MONGODB_URI`

---

## 🏗 Production Deployment

```bash
# Build React frontend
cd client && npm run build

# The Express server serves the built React app
# Set NODE_ENV=production in server/.env
cd server && NODE_ENV=production node index.js
```

Deploy to: **Railway**, **Render**, **Fly.io**, or **Heroku**  
Database:  **MongoDB Atlas** (free M0 cluster)
