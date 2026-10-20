# Inkwell - AI-Powered Full-Stack Blog Application (MERN)

React + Tailwind CSS (frontend) / Node + Express (backend) / MongoDB / Google Gemini (AI).

## Features
Register / Login (JWT) - Profile and password change - Create / edit / delete posts - Markdown editor with toolbar,
live preview and syntax highlighting - Cover image upload - Slug URLs (`/post/my-first-post`) - Draft / Publish /
Unpublish - Dashboard (tabs + Load more) - Search and tags - Share (WhatsApp, X, LinkedIn, copy link, native share) -
AI Blog Generator - AI Blog Ideas - AI Summary - Admin panel - Responsive UI.

## Requirements
Node.js 18+ and MongoDB (local ya MongoDB Atlas).

## Setup
1. Dependencies install karo (project root se):
   ```
   npm install
   npm run install-all
   ```
2. Backend ki env file banao:
   ```
   cd server
   copy .env.example .env      (Mac/Linux: cp .env.example .env)
   ```
   `server/.env` kholo aur bharo: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY` (aur chaho to `ADMIN_EMAIL`).
3. Project root se dono ek saath chalao:
   ```
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend:  http://localhost:5000

Alag-alag chalana ho to: `cd server && npm run dev` aur `cd client && npm run dev`.

## Admin kaise bane
`server/.env` mein `ADMIN_EMAIL=tumhari@email.com` likho, phir usi email se Sign up karo. Navbar mein Admin link aa jayega.

## API summary
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET / PUT | /api/auth/me, /api/auth/profile, /api/auth/password | login |
| GET | /api/posts?page=&q=&tag= | public (published only) |
| GET | /api/posts/slug/:slug | public (draft sirf owner/admin) |
| GET | /api/posts/mine, /api/posts/id/:id | login |
| POST / PUT / PATCH / DELETE | /api/posts, /api/posts/:id, /api/posts/:id/status | owner/admin |
| POST | /api/upload | login (cover image) |
| POST | /api/ai/generate, /api/ai/ideas, /api/ai/summary | login |
| GET / DELETE | /api/admin/stats, /users, /posts | admin |

## Deploy karte waqt
- Frontend alag deploy ho to `client/.env` mein `VITE_API_URL=https://your-backend/api` set karo aur backend `.env` mein `CLIENT_URL` frontend ka URL do.
- Cover images abhi server ke `uploads/` folder mein save hoti hain. Render/Vercel jaisi hosting par ye folder reset ho jata hai, wahan Cloudinary jaisi service use karo.
