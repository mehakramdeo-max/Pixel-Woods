import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { io as createClient } from 'socket.io-client'
import { createGameServer } from '../../backend/server.js'

const server = createGameServer({ port: 0, frontendOrigin: '*' })
const clients = []
const latestRooms = new Map()
let serverUrl

before(async () => {
  const address = await server.listen()
  serverUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  clients.forEach((client) => client.disconnect())
  await server.close()
})

function connectClient() {
  const client = createClient(serverUrl, { autoConnect: false, reconnection: false })
  clients.push(client)
  client.on('room:state', (room) => latestRooms.set(client, room))
  client.connect()
  return new Promise((resolve, reject) => {
    client.once('connect', () => resolve(client))
    client.once('connect_error', reject)
  })
}

function emitAck(client, event, payload = {}) {
  return new Promise((resolve, reject) => {
    client.timeout(2_000).emit(event, payload, (error, response) => {
      if (error) reject(error)
      else resolve(response)
    })
  })
}

function waitForRoom(client, predicate) {
  const current = latestRooms.get(client)
  if (current && predicate(current)) return Promise.resolve(current)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client.off('room:state', onRoom)
      reject(new Error('Timed out waiting for room state'))
    }, 2_000)
    function onRoom(room) {
      if (!predicate(room)) return
      clearTimeout(timeout)
      client.off('room:state', onRoom)
      resolve(room)
    }
    client.on('room:state', onRoom)
  })
}

test('health endpoint responds and Socket.IO allows configured frontend origins', async () => {
  const configuredServer = createGameServer({
    port: 0,
    frontendOrigin: 'http://localhost:5173, http://localhost:5174',
  })

  try {
    const address = await configuredServer.listen()
    const serverUrlForTest = `http://127.0.0.1:${address.port}`
    const healthResponse = await fetch(`${serverUrlForTest}/health`)

    assert.equal(healthResponse.status, 200)
    assert.deepEqual(await healthResponse.json(), { status: 'ok', activeRooms: 0 })

    const allowedOriginResponse = await fetch(
      `${serverUrlForTest}/socket.io/?EIO=4&transport=polling`,
      { headers: { Origin: 'http://localhost:5174' } },
    )
    assert.equal(allowedOriginResponse.status, 200)
    assert.equal(allowedOriginResponse.headers.get('access-control-allow-origin'), 'http://localhost:5174')

    const otherOriginResponse = await fetch(
      `${serverUrlForTest}/socket.io/?EIO=4&transport=polling`,
      { headers: { Origin: 'https://untrusted.example' } },
    )
    assert.equal(otherOriginResponse.headers.get('access-control-allow-origin'), null)
  } finally {
    await configuredServer.close()
  }
})

test('server validates rooms, synchronizes a secret match, and cleans up departures', async () => {
  const host = await connectClient()
  const guest = await connectClient()
  const thirdPlayer = await connectClient()
  const created = await emitAck(host, 'room:create', {
    name: 'Host',
    avatar: 'ranger',
    color: '#6e8a68',
    category: 'Science and Discovery',
    difficulty: 'easy',
    isPrivate: true,
  })

  assert.equal(created.ok, true)
  assert.match(created.room.code, /^[A-HJ-NP-Z2-9]{6}$/)
  assert.equal(created.room.word, null)
  assert.equal((await emitAck(guest, 'room:join', { name: 'Guest', code: 'BAD' })).ok, false)
  assert.equal((await emitAck(guest, 'room:join', { name: 'Guest', code: 'ABC234', isPrivate: true })).ok, false)
  assert.equal((await emitAck(guest, 'room:join', {
    name: 'Guest',
    code: created.room.code,
    isPrivate: false,
  })).ok, false)

  const twoPlayerState = waitForRoom(host, (room) => room.players.length === 2)
  const joined = await emitAck(guest, 'room:join', {
    name: 'Guest',
    avatar: 'pilot',
    color: '#d88752',
    code: created.room.code,
    isPrivate: true,
  })
  assert.equal(joined.ok, true)
  const sharedLobby = await twoPlayerState
  assert.equal(sharedLobby.players.length, 2)
  assert.equal(sharedLobby.players[1].name, 'Guest')
  assert.equal((await emitAck(thirdPlayer, 'room:join', {
    name: 'Third',
    code: created.room.code,
    isPrivate: true,
  })).ok, false)
  assert.equal((await emitAck(host, 'room:start')).ok, false)
  assert.equal((await emitAck(host, 'room:ready', { ready: 'yes' })).ok, false)

  await emitAck(host, 'room:ready', { ready: true })
  await emitAck(guest, 'room:ready', { ready: true })
  const playingState = waitForRoom(host, (room) => room.status === 'playing')
  assert.equal((await emitAck(host, 'room:start')).ok, true)
  let state = await playingState
  assert.equal(Object.hasOwn(state.word, 'answer'), false)
  assert.ok(state.word.slots.every((letter) => letter === ''))
  assert.equal((await emitAck(host, 'room:start')).ok, false)
  assert.equal((await emitAck(thirdPlayer, 'game:guess', { letter: 'A' })).ok, false)
  assert.equal((await emitAck(host, 'game:guess', { letter: '12' })).ok, false)
  assert.equal((await emitAck(host, 'game:hint')).ok, false)

  const secret = server.rooms.get(created.room.code).match.answer
  const wrongLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((letter) => !secret.includes(letter)).slice(0, 3)
  assert.equal(wrongLetters.length, 3)
  const firstGuessState = waitForRoom(host, (room) => room.word.guesses.includes(wrongLetters[0]))
  assert.equal((await emitAck(host, 'game:guess', { letter: wrongLetters[0] })).ok, true)
  state = await firstGuessState
  assert.equal((await emitAck(guest, 'game:guess', { letter: wrongLetters[0] })).ok, false)
  assert.equal(latestRooms.get(guest).word.mistakes, state.word.mistakes)

  for (const [index, letter] of wrongLetters.slice(1).entries()) {
    const nextMistakes = index + 2
    const nextState = waitForRoom(host, (room) => room.word.mistakes === nextMistakes)
    assert.equal((await emitAck(host, 'game:guess', { letter })).ok, true)
    state = await nextState
  }
  assert.equal(state.word.hintAvailable, true)
  const hintState = waitForRoom(host, (room) => Boolean(room.word.hint))
  assert.equal((await emitAck(guest, 'game:hint')).ok, true)
  state = await hintState
  assert.equal(state.word.mistakes, 3)
  assert.equal(Object.hasOwn(state.word, 'answer'), false)

  for (const letter of new Set(secret)) {
    if (state.status === 'finished') break
    if (state.word.guesses.includes(letter)) continue
    const solvedState = waitForRoom(host, (room) => room.word.guesses.includes(letter))
    assert.equal((await emitAck(guest, 'game:guess', { letter })).ok, true)
    state = await solvedState
  }
  if (state.status !== 'finished') state = await waitForRoom(host, (room) => room.status === 'finished')
  assert.equal(state.status, 'finished')
  assert.equal(state.word.answer, secret)
  assert.equal(latestRooms.get(guest).word.answer, secret)
  assert.equal(state.players.find((player) => player.id === guest.id).score, 1)

  await emitAck(host, 'room:ready', { ready: true })
  await emitAck(guest, 'room:ready', { ready: true })
  const nextRound = waitForRoom(host, (room) => room.status === 'playing')
  assert.equal((await emitAck(host, 'room:start')).ok, true)
  state = await nextRound
  assert.equal(Object.hasOwn(state.word, 'answer'), false)

  const roomClosed = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Guest was not notified when host left')), 2_000)
    guest.once('room:closed', (message) => {
      clearTimeout(timeout)
      resolve(message)
    })
  })
  assert.equal((await emitAck(host, 'room:leave')).ok, true)
  assert.match((await roomClosed).reason, /host left/i)
  const guestCanCreate = await emitAck(guest, 'room:create', {
    name: 'Guest',
    category: 'Science and Discovery',
    difficulty: 'easy',
  })
  assert.equal(guestCanCreate.ok, true)
})

test('a disconnected player ends the active round without leaving stale membership', async () => {
  const host = await connectClient()
  const guest = await connectClient()
  const created = await emitAck(host, 'room:create', {
    name: 'ReconnectHost',
    category: 'Science and Discovery',
    difficulty: 'easy',
  })
  assert.equal(created.ok, true)
  const joinedState = waitForRoom(host, (room) => room.players.length === 2)
  assert.equal((await emitAck(guest, 'room:join', {
    name: 'DisconnectingGuest',
    code: created.room.code,
  })).ok, true)
  await joinedState
  await emitAck(host, 'room:ready', { ready: true })
  await emitAck(guest, 'room:ready', { ready: true })
  const playingState = waitForRoom(host, (room) => room.status === 'playing')
  assert.equal((await emitAck(host, 'room:start')).ok, true)
  await playingState

  const finishedState = waitForRoom(host, (room) => (
    room.status === 'finished' && room.word.outcome === 'opponent-left'
  ))
  guest.disconnect()
  const state = await finishedState
  assert.equal(typeof state.word.answer, 'string')
  assert.equal(state.players.length, 1)

  const replacement = await connectClient()
  const rejoinedState = waitForRoom(host, (room) => (
    room.players.length === 2 && room.players.some((player) => player.name === 'Replacement')
  ))
  assert.equal((await emitAck(replacement, 'room:join', {
    name: 'Replacement',
    code: created.room.code,
  })).ok, true)
  await rejoinedState
})
