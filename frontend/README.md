# Pixel Woods Hangman

Retro arcade Hangman with solo play, same-device local multiplayer, and server-backed online/private rooms.

## Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

## Run the online room server

Open a second terminal:

```powershell
cd backend
npm install
npm start
```

Use Node.js 22.9 or newer. To customize the server settings, copy `backend/.env.example`
to `backend/.env`; the server loads that file when it starts. The defaults work for local
development at `http://localhost:5173`.

The server listens on `http://localhost:3001`. Its health endpoint is `http://localhost:3001/health`.
If the frontend and server are hosted at different origins, set `FRONTEND_ORIGIN` for the backend
to the frontend's exact origin.

The frontend reads the server URL from `VITE_MULTIPLAYER_SERVER_URL`. Copy `frontend/.env.example`
to `frontend/.env` to override the default `http://localhost:3001`, then restart Vite.
The backend allows the common localhost and `127.0.0.1` development origins on Vite ports 5173
and 5174 by default. Set `FRONTEND_ORIGIN` in `backend/.env` to the exact frontend origin for
production; comma-separate the values if more than one origin is required.

## Multiplayer rules

- Local multiplayer takes turns guessing a category word on the same device. The player who reveals
  the final required letter wins the round.
- Online/private multiplayer uses a shared-word race. Both players see the same masked board and
  guesses; the player whose valid guess completes the word wins. The server chooses the answer,
  validates every guess, and only sends it after the round ends.
- Both online players must join and mark themselves ready. The host starts each round.
- Room codes are generated and checked by the Socket.IO server. A private room is private by code,
  not by network encryption or account access.
- Rooms are stored in memory and disappear when the server restarts. The server currently supports
  two connected players per room and has no database, authentication, matchmaking, or production
  rate-limiting layer.

Display-name/avatar preferences and solo statistics are stored locally in the browser. Room answers
and multiplayer secret words are never written to localStorage.

## Checks

From `frontend`, run `npm run lint` and `npm run build`. The backend uses Node's built-in syntax
check (`node --check backend/server.js` from the project root).
