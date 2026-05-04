# ─── Stage 1: Build frontend ───────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build the Vite app (outputs to frontend/dist)
RUN npm run build


# ─── Stage 2: Backend + serve built frontend ────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend's public folder so Express can serve it
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Expose the backend port (change if yours differs)
EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "backend/server.js"]

