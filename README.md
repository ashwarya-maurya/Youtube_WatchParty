# YouTube Watch Party

A real-time web application for creating or joining a room and watching a shared YouTube video with other participants.

## Current status

Phase 2 foundation is in progress. The project currently provides a React client, an Express + Socket.IO server, a health endpoint, and a basic Socket.IO connection. Room and playback features have not been implemented yet.

## Tech stack

- React
- Vite
- JavaScript
- Node.js
- Express
- Socket.IO

## Project structure

```text
client/     React + Vite frontend
server/     Express + Socket.IO backend
docs/       Architecture documentation
```

## Local setup

### Prerequisites

- Node.js 22 or a current supported Node.js LTS release
- npm

### 1. Install dependencies

Install the frontend dependencies:

```powershell
cd client
npm install
```

Install the backend dependencies:

```powershell
cd server
npm install
```

### 2. Configure environment variables

Create local `.env` files from the provided `.env.example` files.

`server/.env`:

```text
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env`:

```text
VITE_SERVER_URL=http://localhost:3000
```

Do not commit `.env` files. The `.env.example` files document the required variable names.

### 3. Run the backend

```powershell
cd server
npm run dev
```

The health endpoint should be available at:

```text
http://localhost:3000/api/health
```

### 4. Run the frontend

Open a second terminal:

```powershell
cd client
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

## Verification

- Backend starts without errors.
- `GET /api/health` returns a JSON health response.
- Frontend loads in the browser.
- With both applications running, the frontend establishes a Socket.IO connection to the backend.

## Documentation

See [Architecture](docs/architecture.md) for the Phase 1 server-authoritative design, room lifecycle, role policy, event contract, and playback synchronization strategy.

## Known limitations

- Room and playback features are not implemented yet.
- The planned room state will be stored in memory and will be lost if the backend restarts.
- Authentication, persistent storage, and multi-server scaling are outside the deadline MVP scope.
