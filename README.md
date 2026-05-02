# Million Checkboxes

A scalable real-time checkbox synchronization system built using Node.js, Express, WebSockets, Redis, JWT authentication, Docker, and cloud deployment.

This project demonstrates distributed real-time architecture concepts including WebSocket communication, Redis Pub/Sub synchronization, scalable frontend rendering, authentication, and rate limiting.

---

# Live Demo

https://millioncheckboxes.onrender.com

---

# Demo Video

https://youtu.be/w7N3dnpMo_E

---

# GitHub Repository

https://github.com/shiikharrr/MillionCheckboxes

---

# Features

- Real-time checkbox synchronization
- WebSocket-based communication
- Redis persistence
- Redis Pub/Sub architecture
- JWT authentication
- Protected WebSocket connections
- Redis-based rate limiting
- Chunked rendering
- Lazy loading for scalability
- Docker containerization
- Cloud deployment
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
- WebSockets (ws)

## Database / Cache
- Redis
- Upstash Redis

## Authentication
- JWT
- bcryptjs

## Deployment
- Docker
- Render

---

# Architecture Overview

Frontend clients communicate with the Express backend using WebSockets for real-time updates.

Redis is used for:
- persistent checkbox state storage
- Pub/Sub communication
- distributed synchronization
- rate limiting counters

JWT authentication protects write actions and authenticated WebSocket interactions.

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
2. backend validates authentication
3. Redis stores checkbox state
4. Redis Pub/Sub broadcasts update
5. all connected clients receive synchronized update instantly

---

# Redis Pub/Sub

Redis Pub/Sub enables distributed synchronization across multiple backend instances.

This architecture supports horizontal scalability and real-time distributed updates.

---

# Authentication

The application uses JWT-based authentication.

Features:
- user registration
- login
- authenticated WebSocket actions
- protected checkbox interactions

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

To support scalable rendering:
- checkboxes are rendered in chunks
- lazy loading is implemented
- DocumentFragment batching is used

This prevents rendering thousands of DOM nodes simultaneously.

---

# Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

JWT_SECRET=your-secret-key

REDIS_URL=your-redis-url
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/shiikharrr/MillionCheckboxes.git
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm start
```

---

# Docker Support

## Run using Docker Compose

```bash
docker compose up --build
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
Dockerfile
docker-compose.yml
package.json
README.md
```

---

# Scalability Considerations

This project demonstrates:
- distributed Pub/Sub architecture
- scalable real-time synchronization
- chunked frontend rendering
- lazy loading
- stateless JWT authentication
- Redis-backed shared state
- Docker-based deployment

The architecture can be extended to support large-scale collaborative systems.

---

# Future Improvements

- Full virtualization
- OAuth integration
- Multi-room collaboration
- Redis cluster support
- Database persistence
- Kubernetes deployment
- Horizontal backend scaling

---

# Author

Shikhar Gupta
