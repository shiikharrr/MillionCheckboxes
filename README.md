# Million Checkboxes

A scalable real-time checkbox synchronization system built with Node.js, Express, WebSockets, Redis, and JWT authentication.

This project demonstrates distributed real-time architecture concepts including WebSocket communication, Redis Pub/Sub, authentication, rate limiting, and scalable frontend rendering.

---

# Features

- Real-time checkbox synchronization
- WebSocket-based communication
- Redis persistence
- Redis Pub/Sub architecture
- JWT authentication
- Protected WebSocket connections
- Custom Redis-based rate limiting
- Chunked rendering
- Lazy loading for scalability
- Environment variable configuration
- Responsive UI

---

# Tech Stack

## Frontend
- HTML
- CSS
- Vanilla JavaScript

## Backend
- Node.js
- Express.js
- WebSocket (ws)

## Database / Cache
- Redis

## Authentication
- JWT
- bcryptjs

---

# Architecture Overview

Frontend clients communicate with the Express backend using WebSockets for real-time updates.

Redis is used for:
- persistent checkbox state storage
- Pub/Sub communication
- distributed synchronization
- rate limiting counters

Authentication is implemented using JWT tokens.

---

# System Architecture

Client
↓
WebSocket
↓
Express Server
↓
Redis Persistence
↓
Redis Pub/Sub
↓
Distributed Real-Time Updates

---

# Real-Time Synchronization

The application uses WebSockets to synchronize checkbox state instantly between connected users.

When a checkbox is toggled:
1. frontend sends WebSocket event
2. server validates request
3. Redis stores state
4. Redis Pub/Sub broadcasts update
5. all connected clients receive update

---

# Redis Pub/Sub

Redis Pub/Sub enables distributed synchronization across multiple backend instances.

This architecture supports horizontal scalability.

---

# Authentication

The application uses JWT-based authentication.

Features:
- user registration
- login
- protected WebSocket actions
- authenticated socket connections

Guests can view checkbox states but cannot modify them.

---

# Rate Limiting

A custom Redis-based rate limiter prevents abuse.

Implementation:
- per-user action tracking
- Redis counters
- expiration windows
- WebSocket request limiting

---

# Frontend Optimization

To support large-scale rendering:
- checkboxes are rendered in chunks
- lazy loading is implemented
- DocumentFragment batching is used

This avoids rendering thousands of DOM elements simultaneously.

---

# Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

JWT_SECRET=my-super-secret-jwt-key

REDIS_URL=redis://localhost:6379
```

---

# Installation

## Clone repository

```bash
git clone <your-repo-url>
```

## Install dependencies

```bash
npm install
```

## Start Redis

```bash
docker start redis-server
```

OR

```bash
docker run --name redis-server -p 6379:6379 redis
```

## Start application

```bash
npm start
```

---

# Project Structure

```bash
client/
  index.html
  style.css
  script.js

server/
  index.js
  auth.js
  redis.js
  rateLimiter.js
  users.js

.env
package.json
README.md
```

---

# Future Improvements

- Full virtualization
- OAuth / OIDC integration
- Multi-room collaboration
- Redis cluster support
- Database persistence
- Kubernetes deployment
- Horizontal backend scaling

---

# Scalability Considerations

This project demonstrates:
- distributed Pub/Sub architecture
- real-time synchronization
- scalable frontend rendering
- stateless JWT authentication
- Redis-backed shared state

The architecture can be extended to support large-scale collaborative systems.

---

# Author

Shikhar Gupta