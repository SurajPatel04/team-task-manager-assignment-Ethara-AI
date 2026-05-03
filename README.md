# Team Task Manager

Built as part of the Full-Stack Assignment for **Ethara AI**
By: **Suraj Patel**

🌐 **Live Demo:** [https://team-task-manager.surajpatel.dev/](https://team-task-manager.surajpatel.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### 1. Backend Setup

cd backend
npm install

# Create .env file in backend folder
cp .env-sample .env
# Then fill in your values in .env

npm run dev

### 2. Frontend Setup

cd frontend
npm install

# Create .env file in frontend folder
cp .env.example .env
# Then fill in your values in .env

npm run dev

---

## 🧪 Test Accounts

Use these accounts to test the application:

| Role | Email | Password |
|---|---|---|
| Admin | suraj@gmail.com | Password123 |
| Member | rahul@gmail.com | Password123 |
| Member | priya@gmail.com | Password123 |

> **Admin** → suraj@gmail.com is admin of 15 projects
> **Rahul** → rahul@gmail.com is admin of 7 projects  
> **Priya** → priya@gmail.com is admin of 30 projects

To populate test data, navigate to the backend directory and run:
```bash
npm run seed
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server Port | `5000` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `CORS_ORIGIN` | Frontend Origin | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | Access JWT Secret | `your_secret` |
| `ACCESS_TOKEN_EXPIRY` | Access Token Duration | `30m` |
| `REFRESH_TOKEN_SECRET` | Refresh JWT Secret | `your_refresh_secret` |
| `REFRESH_TOKEN_EXPIRY` | Refresh Token Duration | `10d` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |

---

## 🛠️ Key Features

- **JWT Authentication** with httpOnly cookies and refresh token rotation
- **Proactive Session Management** — silently refreshes tokens 2 min before expiry
- **Role-Based Access** — Admin vs Member permissions per project
- **Token Reuse Detection** — revokes all sessions on suspicious activity
- **Paginated Search** — backend-powered debounced search
- **Dashboard Analytics** — task stats, overdue tracking, team workload
- **Mobile Responsive** — works on all screen sizes

---

## 📡 API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/signin` | Login user |
| POST | `/auth/logout` | Logout and revoke token |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user |

### Projects
| Method | Route | Who | Description |
|---|---|---|---|
| POST | `/projects` | Any | Create project |
| GET | `/projects?search=&page=` | Any | Get all my projects |
| GET | `/projects/:id` | Member+ | Get project details |
| DELETE | `/projects/:id` | Creator | Delete project |
| GET | `/projects/:id/members` | Member+ | Get project members |
| POST | `/projects/:id/members` | Admin | Add member by email |
| DELETE | `/projects/:id/members/:userId` | Admin | Remove member |
| PATCH | `/projects/:id/members/:userId/role` | Admin | Change member role |
| DELETE | `/projects/:id/leave` | Member | Leave project |

### Tasks
| Method | Route | Who | Description |
|---|---|---|---|
| POST | `/tasks` | Admin | Create task |
| GET | `/tasks?projectId=` | Member+ | Get all tasks |
| GET | `/tasks/:id?projectId=` | Member+ | Get single task |
| PUT | `/tasks/:id?projectId=` | Admin | Update full task |
| PATCH | `/tasks/:id/status?projectId=` | Member+ | Update status only |
| DELETE | `/tasks/:id?projectId=` | Admin | Delete task |

### Dashboard
| Method | Route | Who | Description |
|---|---|---|---|
| GET | `/dashboard/stats?projectId=` | Member+ | Task stats by status |
| GET | `/dashboard/overdue?projectId=` | Member+ | Overdue tasks |
| GET | `/dashboard/user-tasks?projectId=` | Admin | Tasks per user |

---

## 🗄️ Tech Stack

| Part | Technology |
|---|---|
| Frontend | React + Redux + Tailwind CSS |
| Backend | Node.js + Express (ES Modules) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Refresh Tokens + httpOnly Cookies |
| Validation | Zod |
| Deployment | Render + Vercel |

---

## 🌱 Seed Data

npm run seed

Creates 3 users, 52 projects, 728 tasks for testing.

Credentials (password: Password123):
- suraj@gmail.com — admin of 15 projects
- rahul@gmail.com — admin of 7 projects  
- priya@gmail.com — admin of 30 projects