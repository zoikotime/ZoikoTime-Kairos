# ZT-CHATBOT

ZoikoTime desktop chatbot scaffold with:

- `frontend`: React + Vite + Electron desktop shell
- `backend`: Express + Mongo-ready chatbot backend
- FAQ-style grounded chatbot responses for ZoikoTime desktop and web app questions

## Current scope

- Employee onboarding with name, work email, and company
- Chatbot responses from a local ZoikoTime knowledge base
- Conversation history persistence in memory and MongoDB when available
- Human escalation flow intentionally kept as a placeholder for the next phase

## Project structure

```text
ZT-CHATBOT/
|-- frontend/
|-- backend/
|-- .env.example
`-- README.md
```

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies:
   - `cd frontend && npm install`
   - `cd backend && npm install`
3. Run development separately:
   - frontend: `npm run dev`
   - backend: `npm run node`

## Main routes

- `POST /api/auth/verify`
- `POST /api/chat`
- `GET /api/chat/history/:sessionId`

## Notes

- `nodemon` is still available in the backend via `npm run dev`
- Manager lookup and human escalation can be connected later through your company API
