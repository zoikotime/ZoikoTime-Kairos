# ZT-CHATBOT

ZoikoTime chatbot with:

- `frontend`: React + Vite + Electron shell
- `backend`: Express API
- Supabase-backed user, chat history, conversation, and mail rate-limit persistence

## What must exist in Supabase

This project does not create tables automatically. You must create the schema in your Supabase project before history and mail counters will persist.

1. Open Supabase SQL Editor.
2. Run `backend/supabase/schema.sql`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Fill in:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - SMTP values for support mail

## Local setup

1. Install dependencies:
   - `cd frontend && npm install`
   - `cd backend && npm install`
2. Start the backend:
   - `cd backend && npm run dev`
3. Start the frontend:
   - `cd frontend && npm run dev`

## Main routes

- `POST /api/auth/verify`
- `POST /api/chat`
- `GET /api/chat/history/:sessionId`
- `GET /api/chat/sessions?email=...`
- `POST /api/mail/send`

## Persistence notes

- User onboarding is stored in `users`.
- Chat session summaries are stored in `conversations`.
- Message history is stored in `chats`.
- Daily support-mail limits are stored in `email_rate_limits`.
- If Supabase is unavailable, chat can still work temporarily from in-memory fallback, but history will not survive restart.
