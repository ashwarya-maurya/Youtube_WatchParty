# YouTube Watch Party

A real-time YouTube Watch Party application where users can create rooms, join with a room code or share link, watch videos together, chat, send reactions, and manage participant roles.

## Live application

- Frontend: `https://youtube-watch-party-client-u2yn.onrender.com`
- Backend health check: `https://youtube-watch-party-server-0eom.onrender.com/api/health`

## Features

- Create and join watch-party rooms
- Shareable room codes and room links
- Host, Moderator, and Participant roles
- Real-time participant list updates
- Host can promote Participants to Moderator
- Host can remove Participants and Moderators
- Server-enforced role permissions
- Synchronized YouTube video loading
- Synchronized play, pause, and seek actions
- Late joiners receive the current playback state
- Real-time text chat
- Transient emoji reactions
- Disconnect and room-cleanup handling
- Responsive dark-mode interface

## Tech stack

### Frontend

- React
- Vite
- React Router
- Socket.IO Client
- YouTube IFrame Player API through `react-youtube`

### Backend

- Node.js
- Express
- Socket.IO
- In-memory JavaScript room state

### Deployment

- Render Static Site for the React frontend
- Render Web Service for the Express + Socket.IO backend

## Architecture overview

The backend is authoritative for room state, participants, roles, permissions, and shared playback state.

```text
React client
    ↓ Socket.IO events
Express + Socket.IO server
    ↓
Validators → Services → In-memory room store
    ↓
Room-scoped broadcast to connected clients
```

The client provides the user interface, but protected actions are always validated on the backend using the connected user's `socket.id`.

## Roles and permissions

| Action | Host | Moderator | Participant |
|---|---:|---:|---:|
| Load/change video | Yes | Yes | No |
| Play/pause/seek | Yes | Yes | No |
| Promote participant | Yes | No | No |
| Remove participant | Yes | No | No |
| Send chat/reactions | Yes | Yes | Yes |

## Local setup

### Prerequisites

- Node.js 22 or another compatible Node.js version
- npm

### Install dependencies

```powershell
cd client
npm install
```

Open another terminal:

```powershell
cd server
npm install
```

### Environment variables

Create local `.env` files from the provided `.env.example` files.

`server/.env`

```text
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env`

```text
VITE_SERVER_URL=http://localhost:3000
```

Do not commit `.env` files.

### Run locally

Start the backend:

```powershell
cd server
npm run dev
```

Backend health endpoint:

```text
http://localhost:3000/api/health
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL, normally:

```text
http://localhost:5173
```

## Production configuration

### Backend environment variable

```text
CLIENT_ORIGIN=https://YOUR_FRONTEND.onrender.com
```

### Frontend environment variable

```text
VITE_SERVER_URL=https://YOUR_BACKEND.onrender.com
```

The Render Static Site also requires this rewrite rule for React Router:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

## Verification commands

Run these inside `client/`:

```powershell
npm run lint
npm run build
```

## Limitations

- Room data is stored only in server memory.
- Restarting the backend clears active rooms and playback state.
- There is no persistent database or authentication system in this deadline MVP.
- The app is designed for a single backend instance; scaling to multiple instances would require shared state such as Redis.

## Learning notes

This project uses Socket.IO instead of REST for playback synchronization because room actions need immediate, bidirectional updates. The backend remains authoritative so users cannot gain Host or Moderator permissions merely by changing frontend code.
