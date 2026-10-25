import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { Server } from 'socket.io'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, DIFFICULTIES, HINT_UNLOCK_MISTAKES, MAX_MISTAKES, getRandomWord } from '../frontend/src/gameData.js'

const PORT = Number(process.env.PORT) || 3001
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ||
  'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'
const ROOM_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function getAllowedOrigins(frontendOrigin) {
  if (frontendOrigin === '*') return '*'
  const origins = Array.isArray(frontendOrigin) ? frontendOrigin : String(frontendOrigin).split(',')
  return origins.map((origin) => origin.trim()).filter(Boolean)
}

export function createGameServer({ port = PORT, frontendOrigin = FRONTEND_ORIGIN } = {}) {
  const rooms = new Map()
  const playerRooms = new Map()

  const httpServer = createServer((request, response) => {
    if (request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ status: 'ok', activeRooms: rooms.size }))
      return
    }
    response.writeHead(200, { 'content-type': 'text/plain' })
    response.end('Pixel Woods multiplayer server')
  })

  const io = new Server(httpServer, {
    cors: { origin: getAllowedOrigins(frontendOrigin), methods: ['GET', 'POST'] },
    maxHttpBufferSize: 10_000,
  })

function makeRoomCode() {
  let code
  do {
    const random = randomBytes(6)
    code = Array.from(random, (byte) => ROOM_CODE_CHARACTERS[byte % ROOM_CODE_CHARACTERS.length]).join('')
  } while (rooms.has(code))
  return code
}

function cleanName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  return name.length >= 1 && name.length <= 18 ? name : null
}

function cleanIdentity(payload) {
  const name = cleanName(payload?.name)
  const validAvatars = ['scout', 'pilot', 'engineer', 'scholar', 'ranger', 'courier']
  const validColors = ['#4e8c83', '#d88752', '#6f86a5', '#927b65', '#6e8a68', '#a56e62']
  const avatar = typeof payload?.avatar === 'string' && validAvatars.includes(payload.avatar)
    ? payload.avatar
    : 'scout'
  const color = typeof payload?.color === 'string' && validColors.includes(payload.color.toLowerCase())
    ? payload.color
    : '#4e8c83'
  if (!name) return null
  return { name, avatar, color }
}

function publicRoom(room) {
  const finished = room.match?.status === 'finished'
  const answer = finished ? room.match.answer : null
  const maskedWord = room.match
    ? [...room.match.answer].map((letter) => (
      finished || room.match.guesses.includes(letter) ? letter : ''
    ))
    : []

  return {
    code: room.code,
    isPrivate: room.isPrivate,
    hostId: room.hostId,
    players: room.players.map(({ id, name, avatar, color, ready, score }) => ({
      id,
      name,
      avatar,
      color,
      ready,
      score,
    })),
    settings: room.settings,
    status: room.match?.status || 'waiting',
    word: room.match ? {
      category: room.match.category,
      difficulty: room.match.difficulty,
      topic: room.match.topic,
      slots: maskedWord,
      guesses: [...room.match.guesses],
      mistakes: room.match.mistakes,
      remaining: MAX_MISTAKES - room.match.mistakes,
      hint: room.match.hintRevealed || finished ? room.match.hint : null,
      hintAvailable: room.match.status === 'playing' &&
        !room.match.hintRevealed &&
        room.match.mistakes >= HINT_UNLOCK_MISTAKES,
      ...(finished ? { answer } : {}),
      winnerId: finished ? room.match.winnerId : null,
      outcome: finished ? room.match.outcome : null,
    } : null,
  }
}

function emitRoom(room) {
  io.to(room.code).emit('room:state', publicRoom(room))
}

function respond(callback, result) {
  if (typeof callback === 'function') callback(result)
}

function removeSocketFromRoom(socket, notify = true) {
  const code = playerRooms.get(socket.id)
  const room = code && rooms.get(code)
  if (!room) return
  playerRooms.delete(socket.id)
  socket.leave(code)
  room.players = room.players.filter((player) => player.id !== socket.id)

  if (room.hostId === socket.id || room.players.length === 0) {
    rooms.delete(code)
    room.players.forEach((player) => playerRooms.delete(player.id))
    io.to(code).emit('room:closed', { reason: 'The host left the room.' })
    io.in(code).socketsLeave(code)
    return
  }

  if (room.match?.status === 'playing') {
    room.match.status = 'finished'
    room.match.outcome = 'opponent-left'
  }
  if (notify) emitRoom(room)
}

function validateRoomSettings(payload) {
  const category = payload?.category
  const difficulty = payload?.difficulty
  if (!Object.hasOwn(CATEGORIES, category) || !Object.hasOwn(DIFFICULTIES, difficulty)) return null
  return { category, difficulty }
}

function addPlayer(socket, room, identity) {
  const player = {
    id: socket.id,
    ...identity,
    ready: false,
    score: 0,
  }
  room.players.push(player)
  playerRooms.set(socket.id, room.code)
  socket.join(room.code)
  return player
}

io.on('connection', (socket) => {
  socket.on('room:create', (payload, callback) => {
    if (playerRooms.has(socket.id)) return respond(callback, { ok: false, error: 'Leave your current room first.' })
    const identity = cleanIdentity(payload)
    const settings = validateRoomSettings(payload)
    if (!identity) return respond(callback, { ok: false, error: 'Choose a display name between 1 and 18 characters.' })
    if (!settings) return respond(callback, { ok: false, error: 'Choose a valid category and difficulty.' })

    const code = makeRoomCode()
    const room = {
      code,
      isPrivate: payload.isPrivate === true,
      hostId: socket.id,
      players: [],
      settings,
      match: null,
    }
    rooms.set(code, room)
    addPlayer(socket, room, identity)
    emitRoom(room)
    respond(callback, { ok: true, room: publicRoom(room) })
  })

  socket.on('room:join', (payload, callback) => {
    if (playerRooms.has(socket.id)) return respond(callback, { ok: false, error: 'Leave your current room first.' })
    const identity = cleanIdentity(payload)
    const code = typeof payload?.code === 'string' ? payload.code.trim().toUpperCase() : ''
    if (!identity) return respond(callback, { ok: false, error: 'Choose a display name between 1 and 18 characters.' })
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) return respond(callback, { ok: false, error: 'Room codes are six letters or numbers.' })
    const room = rooms.get(code)
    if (!room || room.isPrivate !== (payload.isPrivate === true)) {
      return respond(callback, { ok: false, error: 'That room was not found. Check the code and room type.' })
    }
    if (room.players.length >= 2 || room.match?.status === 'playing') {
      return respond(callback, { ok: false, error: 'That room is already full or in progress.' })
    }

    addPlayer(socket, room, identity)
    emitRoom(room)
    respond(callback, { ok: true, room: publicRoom(room) })
  })

  socket.on('room:ready', (payload, callback) => {
    const room = rooms.get(playerRooms.get(socket.id))
    const player = room?.players.find((entry) => entry.id === socket.id)
    if (!room || !player || room.match?.status === 'playing' || typeof payload?.ready !== 'boolean') {
      return respond(callback, { ok: false, error: 'You cannot change ready state now.' })
    }
    player.ready = payload.ready
    emitRoom(room)
    respond(callback, { ok: true })
  })

  socket.on('room:start', (_payload, callback) => {
    const room = rooms.get(playerRooms.get(socket.id))
    if (!room || room.hostId !== socket.id) return respond(callback, { ok: false, error: 'Only the host can start the match.' })
    if (room.match?.status === 'playing') return respond(callback, { ok: false, error: 'A round is already in progress.' })
    if (room.players.length !== 2 || room.players.some((player) => !player.ready)) {
      return respond(callback, { ok: false, error: 'Both players must be in the room and ready.' })
    }
    const selected = getRandomWord(room.settings.category, room.settings.difficulty)
    room.match = {
      status: 'playing',
      answer: selected.word,
      category: selected.category,
      difficulty: selected.difficulty,
      topic: selected.topic,
      hint: selected.hint,
      guesses: [],
      mistakes: 0,
      hintRevealed: false,
      winnerId: null,
      outcome: null,
    }
    room.players.forEach((player) => { player.ready = false })
    emitRoom(room)
    respond(callback, { ok: true })
  })

  socket.on('game:guess', (payload, callback) => {
    const room = rooms.get(playerRooms.get(socket.id))
    const match = room?.match
    if (!room || match?.status !== 'playing') return respond(callback, { ok: false, error: 'There is no active round.' })
    const letter = typeof payload?.letter === 'string' ? payload.letter.toUpperCase() : ''
    if (!/^[A-Z]$/.test(letter)) return respond(callback, { ok: false, error: 'Choose one letter from A to Z.' })
    if (match.guesses.includes(letter)) return respond(callback, { ok: false, error: 'That letter has already been guessed.' })

    match.guesses.push(letter)
    if (!match.answer.includes(letter)) match.mistakes += 1
    if ([...new Set(match.answer)].every((answerLetter) => match.guesses.includes(answerLetter))) {
      match.status = 'finished'
      match.outcome = 'solved'
      match.winnerId = socket.id
      room.players.find((player) => player.id === socket.id).score += 1
    } else if (match.mistakes >= MAX_MISTAKES) {
      match.status = 'finished'
      match.outcome = 'missed'
    }
    emitRoom(room)
    respond(callback, { ok: true })
  })

  socket.on('game:hint', (_payload, callback) => {
    const room = rooms.get(playerRooms.get(socket.id))
    const match = room?.match
    if (!room || match?.status !== 'playing') return respond(callback, { ok: false, error: 'There is no active round.' })
    if (match.hintRevealed || match.mistakes < HINT_UNLOCK_MISTAKES) {
      return respond(callback, { ok: false, error: 'The word hint is not available.' })
    }
    match.hintRevealed = true
    emitRoom(room)
    respond(callback, { ok: true })
  })

  socket.on('room:leave', (_payload, callback) => {
    removeSocketFromRoom(socket)
    respond(callback, { ok: true })
  })

  socket.on('disconnect', () => removeSocketFromRoom(socket))
})

  function listen() {
    return new Promise((resolveListen, rejectListen) => {
      httpServer.once('error', rejectListen)
      httpServer.listen(port, () => {
        httpServer.off('error', rejectListen)
        resolveListen(httpServer.address())
      })
    })
  }

  function close() {
    return new Promise((resolveClose) => io.close(resolveClose))
  }

  return { io, httpServer, rooms, listen, close }
}

const isRunDirectly = process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isRunDirectly) {
  const server = createGameServer()
  server.httpServer.listen(PORT, () => {
    console.log(`Pixel Woods multiplayer server listening on port ${PORT}`)
  })
}
