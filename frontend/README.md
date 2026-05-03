# Team Task Manager

![Team Task Manager](https://img.shields.io/badge/Status-Live-success)

A modern, responsive, and robust full-stack project management dashboard. Built for teams to collaborate, track progress, and manage tasks efficiently.

🌐 **Live Demo:** [https://team-task-manager.surajpatel.dev/](https://team-task-manager.surajpatel.dev/)

## Features
- **Authentication:** Secure user login and registration with JWT.
- **Project Management:** Create, view, update, and delete projects.
- **Task Tracking:** Assign tasks to team members, set priorities, due dates, and update statuses (Todo, In Progress, Done).
- **Role-Based Access Control:** Admin and Member roles with tailored permissions.
- **Responsive Design:** A beautiful, fully responsive UI built with Tailwind CSS that works seamlessly on desktop and mobile.
- **Interactive UI:** Glassmorphism effects, loading states, modal confirmations, and toast notifications.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, React Router, Lucide Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```

2. **Backend Setup:**
   Navigate to the backend directory, install dependencies, and set up your `.env` file.
   ```bash
   cd backend
   npm install
   cp .env-sample .env
   npm run dev
   ```

3. **Frontend Setup:**
   Navigate to the frontend directory, install dependencies, and start the Vite dev server.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment
- The frontend is deployed and automatically built on **Netlify**.
- The backend is deployed and hosted on **Render**.
