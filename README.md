# Pixel Woods Hangman

Pixel Woods is a retro arcade Hangman game built with React and Vite. Play solo, take turns
with a friend on one device, or join a real-time two-player room using the Socket.IO server.

## Features

- Solo Hangman with categories, difficulty, hints, score and streak tracking.
- Local two-player pass-and-play mode.
- Anonymous player names, pixel-style avatars, and avatar colours.
- Public and private server-managed rooms with server-generated six-character codes.
- Shared two-player Hangman rounds. The server validates guesses and keeps the answer private
  until the round ends.
- Ready checks, player scores, replay, room departure handling, and visible connection errors.
- Responsive arcade UI and physical/on-screen keyboard input.

Private rooms use a shareable code; they are not password-protected or encrypted separately.
Online play requires the backend. Solo and local play do not.

## Technology and project layout

- React 19 and Vite for the frontend.
- Node.js and Socket.IO for real-time multiplayer.
- Node's built-in test runner and Socket.IO client for server integration tests.
- In-memory server rooms; no database, accounts, or login.

```text
frontend/
  src/
    App.jsx                 Main menu, solo game, local play, and screen navigation
    MultiplayerScreens.jsx  Player profiles, room lobby, and online match UI
    gameData.js             Shared word bank and game rules
    playerProfile.js        Local display-name/avatar preferences
    scoreStorage.js         Local solo score and streak storage
  test/
    multiplayer.test.js     Two-client Socket.IO integration test
backend/
  server.js                 Authoritative Socket.IO room and game server
```

## Requirements

- Node.js 22.9 or newer. The backend npm scripts use Node's `--env-file-if-exists` option.
- npm.
- A network connection is only needed for online/private multiplayer; solo and local play run
  entirely in the browser.

## Install and run locally

Open two terminals in the project folder. In the first, install and start the backend:

```powershell
cd .\backend
npm install
npm start
```

In the second terminal, install and start the frontend:

```powershell
cd .\frontend
npm install
npm run dev
```

Vite normally runs at `http://localhost:5173` (or the next available port, such as `5174`).
The backend listens on port `3001`. Check it at `http://localhost:3001/health`.

## Environment variables

The checked-in example files are safe development defaults. Copy them only when you need to
override a setting:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

- `VITE_MULTIPLAYER_SERVER_URL` is the Socket.IO server URL used by the browser. Set it in
  `frontend/.env`, then restart Vite.
- `PORT` is the backend HTTP/Socket.IO port.
- `FRONTEND_ORIGIN` is the exact browser origin allowed to connect to the backend, such as
  `http://localhost:5173`. Multiple allowed origins can be separated by commas. The backend
  example allows the common localhost and `127.0.0.1` origins on ports 5173 and 5174; for
  production, replace these with the exact deployed frontend origin(s).

The checked-in example values contain no credentials. Vite embeds `VITE_MULTIPLAYER_SERVER_URL`
when it builds the frontend, so set the production value before running the production build.

## Test from another device on your Wi-Fi

The backend listens on network interfaces by default. To make Vite available to another device,
run it with a host address:

```powershell
cd .\frontend
npm run dev -- --host 0.0.0.0
```

Find this computer's IPv4 address with `ipconfig`. On the phone or second computer, open
`http://<COMPUTER-IP>:5173` (substitute the computer's IPv4 address). For online play, update
`frontend/.env` to use `VITE_MULTIPLAYER_SERVER_URL=http://<COMPUTER-IP>:3001` and set
`backend/.env` to include `FRONTEND_ORIGIN=http://<COMPUTER-IP>:5173`. Restart Vite and the
backend after changing these values. Allow the two ports through the computer's firewall on a
trusted private network. Do not expose these development servers directly to the public internet.

## Testing and checks

From the frontend folder:

```powershell
npm test
npm run lint
npm run build
```

The multiplayer integration tests start an in-process backend and connect independent Socket.IO
clients. They cover the health endpoint, allowed development origins, server-issued room codes,
invalid and full room joins, ready/start validation, shared player state, duplicate and malformed
guesses, hints, answer masking/reveal, replay, and disconnect/host-departure cleanup.

## Test with two browser sessions

1. Start both frontend and backend using the commands above.
2. Open `http://localhost:5173` in two separate browser windows or profiles.
3. In each, choose **Online Multiplayer** or **Private Room**, set a player name/avatar, and continue.
4. In the first browser, create a room and copy its server-generated code.
5. In the second browser, select the matching room type, enter the code, and join.
6. Mark both players ready. The host starts the match; guesses and room state synchronize live.
7. Leave a room using **Leave Room** or **Back**. Leaving an active match asks for confirmation.
   If the network drops, reconnecting does not restore the same socket session; the lobby explains
   that you need to rejoin using the saved room code if that room still exists.

## Deployment preparation and limitations

The frontend and backend must both be hosted for internet-accessible multiplayer. Build the
frontend with `npm run build` from `frontend` and deploy `frontend/dist` to a static host. Deploy
`backend` to a Node.js host that supports long-lived Socket.IO/WebSocket connections. Set
`VITE_MULTIPLAYER_SERVER_URL` to the deployed backend HTTPS URL before building, and set the
backend's `PORT` and `FRONTEND_ORIGIN` using the hosting provider's environment-variable settings.
Configure CORS to the exact production frontend origin. Use HTTPS/WSS; the host must support
WebSocket upgrades or Socket.IO's supported transport fallback. Check the deployed
`/health` endpoint after startup.

The game has not been deployed publicly. Rooms and multiplayer scores are in memory, so restarting
the backend clears rooms; use one server instance unless a shared Socket.IO adapter and shared
state are added. There is no account system, database, same-session reconnect recovery, production
rate limiting, or abuse-prevention layer. Before a public release, select hosting, configure
HTTPS/WSS and CORS, add rate limiting and operational monitoring, and consider persistent storage
or a managed Socket.IO adapter if multiple server instances are needed. Solo scores and harmless
profile preferences remain in each browser's local storage.

## GitHub safety

The root `.gitignore` excludes dependency folders, build output, local environment files, and
local logs. Commit the `.env.example` files, not `.env` files. This working folder currently has
no `.git` repository metadata, so it cannot report a branch or working-tree status yet. No Git
repository was initialized and nothing was committed, pushed, or published as part of this work.
