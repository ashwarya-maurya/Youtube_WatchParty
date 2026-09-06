# YouTube Watch Party

A real-time, role-based YouTube watch-party app built with React, Vite, Node.js, Express, and Socket.IO. Create a room, share its code or link, and watch the same YouTube video together with synchronized controls, chat, and reactions.

## Live demo

- [Open the app](https://youtube-watch-party-client-u2yn.onrender.com)
- [Backend health check](https://youtube-watch-party-server-0eom.onrender.com/api/health)

> The backend is deployed on Render. If it has been idle, its first connection can take a little longer while the service wakes up. The Home page shows connection status and enables room actions once the socket is ready.

## What it does

- Create a private watch-party room or join one using a room code.
- Invite others using a shareable direct room link.
- Load and synchronize YouTube videos for everyone in the room.
- Keep play, pause, and seek actions synchronized.
- Bring late joiners to the current video and playback state.
- Chat in real time and send emoji reactions.
- See live participant updates.
- Leave a room safely; rooms close when the host leaves.

## Roles and permissions

The server is authoritative for room membership, roles, and playback state. Permissions are enforced on the backend using the connected socket, rather than relying only on the UI.

| Action | Host | Moderator | Participant |
| --- | :---: | :---: | :---: |
| Load or change a video | Yes | Yes | No |
| Play, pause, or seek | Yes | Yes | No |
| Promote a participant | Yes | No | No |
| Remove a participant | Yes | No | No |
| Send chat messages and reactions | Yes | Yes | Yes |

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Socket.IO Client |
| Video | YouTube IFrame Player API via `react-youtube` |
| Backend | Node.js, Express 5, Socket.IO |
| State | In-memory room store on the server |
| Deployment | Render Static Site + Render Web Service |

## How it works

```text
React + Vite client
        │
        │  Socket.IO room, playback, chat, and reaction events
        ▼
Express + Socket.IO server
        │
        ├── Validators
        ├── Services and role checks
        └── In-memory room store
        │
        ▼
Room-scoped updates to connected clients
```

The server stores the current video, playback position, playing/paused state, room membership, and roles. It broadcasts approved actions only to the relevant room, allowing each connected client to update its local player and interface.

## Run locally

### Prerequisites

- Node.js 22 or another compatible current Node.js release
- npm

### 1. Install dependencies

In one terminal:

```powershell
cd server
npm install
```

In a second terminal:

```powershell
cd client
npm install
```

### 2. Configure environment variables

Create `.env` files from the supplied examples. Do not commit them.

`server/.env`

```text
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env`

```text
VITE_SERVER_URL=http://localhost:3000
```

### 3. Start the app

Start the Socket.IO/Express server:

```powershell
cd server
npm run dev
```

Then start the Vite client in another terminal:

```powershell
cd client
npm run dev
```

Open the URL printed by Vite, usually [http://localhost:5173](http://localhost:5173). The backend health endpoint is available at [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Verify the frontend

Run these commands from `client/` before committing or deploying:

```powershell
npm run lint
npm run build
```

## Deploy on Render

Deploy the frontend as a **Static Site** and the server as a **Web Service**.

Set these production environment variables:

| Service | Variable | Value |
| --- | --- | --- |
| Backend | `CLIENT_ORIGIN` | Your deployed frontend URL |
| Frontend | `VITE_SERVER_URL` | Your deployed backend URL |

For the React frontend, configure this rewrite rule so direct room links continue to work after refresh:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

After changing `VITE_SERVER_URL`, rebuild and redeploy the frontend because Vite exposes environment variables at build time.

## Manual smoke test

- Create a room and join it from another browser or device.
- Join using both the room code and direct room link.
- Confirm participant roles and host-only moderation actions.
- Change a YouTube video as host or moderator.
- Test repeated play, pause, and seek actions.
- Join after playback has started and confirm late-join synchronization.
- Send chat messages and reactions.
- Leave as a participant, then leave as the host and confirm the room closes.

## Current limitations

- Room data lives in server memory, so restarting the backend clears active rooms and playback state.
- There is no account system or persistent database.
- The app is intended for one backend instance. Horizontal scaling would require shared room state, such as Redis.
- Small network and player-buffering differences can cause minor playback drift between viewers.

## Project notes

Socket.IO is used instead of request/response-only REST because watch parties require low-latency, bidirectional room events. Keeping validation and role checks on the server prevents users from obtaining additional control merely by altering frontend code.
