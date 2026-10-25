import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { ALPHABET, CATEGORIES, DIFFICULTIES, MAX_MISTAKES } from './gameData.js'
import { HangmanDrawing } from './HangmanDrawing.jsx'
import { AVATARS, COLORS, readPlayerProfiles, savePlayerProfiles } from './playerProfile.js'

export function PlayerAvatar({ avatar = 'scout', color = COLORS[0], name = 'Player', compact = false }) {
  const variant = Math.max(0, AVATARS.findIndex((option) => option.id === avatar))
  const accessories = [
    <rect key="accessory" x="14" y="8" width="20" height="5" fill="#d88752" />,
    <><rect key="a1" x="12" y="10" width="24" height="5" fill="#34495e" /><rect key="a2" x="15" y="7" width="18" height="4" fill="#d88752" /></>,
    <><rect key="a1" x="13" y="9" width="22" height="7" fill="#697781" /><rect key="a2" x="17" y="5" width="14" height="4" fill="#f2ebdd" /></>,
    <><rect key="a1" x="13" y="7" width="22" height="5" fill="#d88752" /><rect key="a2" x="17" y="4" width="14" height="4" fill="#d88752" /></>,
    <><rect key="a1" x="12" y="9" width="24" height="5" fill="#4e8c83" /><rect key="a2" x="15" y="6" width="18" height="4" fill="#34495e" /></>,
    <><rect key="a1" x="14" y="7" width="20" height="5" fill="#697781" /><rect key="a2" x="18" y="4" width="12" height="4" fill="#697781" /></>,
  ]

  return (
    <svg
      className={`player-avatar ${compact ? 'avatar-compact' : ''}`}
      viewBox="0 0 48 52"
      role="img"
      aria-label={`${name}, ${AVATARS[variant].name} avatar`}
      style={{ '--avatar-color': color }}
      shapeRendering="crispEdges"
    >
      <rect x="13" y="13" width="22" height="20" fill="#e1b995" />
      {accessories[variant]}
      <rect x="17" y="20" width="4" height="4" fill="#252b30" />
      <rect x="27" y="20" width="4" height="4" fill="#252b30" />
      <rect x="20" y="28" width="8" height="2" fill="#7d5346" />
      <rect x="10" y="34" width="28" height="15" fill="var(--avatar-color)" />
      <rect x="7" y="37" width="4" height="9" fill="#e1b995" />
      <rect x="37" y="37" width="4" height="9" fill="#e1b995" />
      <rect x="14" y="48" width="8" height="3" fill="#34495e" />
      <rect x="26" y="48" width="8" height="3" fill="#34495e" />
    </svg>
  )
}

function PlayerCard({ profile, index, updateProfile, title }) {
  return (
    <article className="identity-card">
      <h2>{title}</h2>
      <label className="identity-name-label" htmlFor={`player-name-${index}`}>DISPLAY NAME</label>
      <input
        id={`player-name-${index}`}
        value={profile.name}
        maxLength={18}
        autoComplete="nickname"
        onChange={(event) => updateProfile(index, 'name', event.target.value)}
      />
      <div className="avatar-preview">
        <PlayerAvatar avatar={profile.avatar} color={profile.color} name={profile.name || `Player ${index + 1}`} />
        <span>{profile.name || `Player ${index + 1}`}</span>
      </div>
      <fieldset className="avatar-picker">
        <legend>CHOOSE A CHARACTER</legend>
        <div className="avatar-options">
          {AVATARS.map((avatar) => (
            <button
              aria-label={`${avatar.name} avatar`}
              aria-pressed={profile.avatar === avatar.id}
              className={`avatar-option ${profile.avatar === avatar.id ? 'selected' : ''}`}
              key={avatar.id}
              onClick={() => updateProfile(index, 'avatar', avatar.id)}
              type="button"
            >
              <PlayerAvatar avatar={avatar.id} color={profile.color} name={avatar.name} compact />
              <span>{avatar.name}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="color-picker">
        <legend>CHARACTER COLOUR</legend>
        <div className="color-options">
          {COLORS.map((color) => (
            <button
              aria-label={`${color} character colour`}
              aria-pressed={profile.color === color}
              className={`color-swatch ${profile.color === color ? 'selected' : ''}`}
              key={color}
              onClick={() => updateProfile(index, 'color', color)}
              style={{ '--swatch-color': color }}
              type="button"
            />
          ))}
        </div>
      </fieldset>
    </article>
  )
}

export function PlayerSetup({ count = 1, title, description, submitLabel, onSubmit, onBack }) {
  const [profiles, setProfiles] = useState(() => readPlayerProfiles(count))
  const [error, setError] = useState('')

  function updateProfile(index, field, value) {
    setProfiles((current) => current.map((profile, profileIndex) => (
      profileIndex === index ? { ...profile, [field]: value } : profile
    )))
  }

  function continueWithProfiles(event) {
    event.preventDefault()
    const cleanedProfiles = profiles.map((profile) => ({ ...profile, name: profile.name.trim() }))
    if (cleanedProfiles.some((profile) => !profile.name)) {
      setError('Enter a display name for each player.')
      return
    }
    if (new Set(cleanedProfiles.map((profile) => profile.name.toLowerCase())).size !== cleanedProfiles.length) {
      setError('Each player needs a different display name.')
      return
    }
    savePlayerProfiles(cleanedProfiles)
    onSubmit(cleanedProfiles)
  }

  return (
    <section className="identity-screen">
      <button className="text-button menu-back" type="button" onClick={onBack}>← MAIN MENU</button>
      <p className="eyebrow">PLAYER PROFILE // NO ACCOUNT NEEDED</p>
      <h1 className="screen-heading">{title}</h1>
      <p className="setup-description">{description}</p>
      <form onSubmit={continueWithProfiles}>
        <div className={`identity-grid ${count === 1 ? 'identity-single' : ''}`}>
          {profiles.map((profile, index) => (
            <PlayerCard
              index={index}
              key={index}
              profile={profile}
              title={count === 1 ? 'YOUR PLAYER' : `PLAYER ${index + 1}`}
              updateProfile={updateProfile}
            />
          ))}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="pixel-button identity-submit" type="submit">{submitLabel}</button>
      </form>
    </section>
  )
}

function OnlineGame({ room, socket, isHost, connected, onBack, onGuess, onHint, onLeave, onReady, onStart, actionError, starting }) {
  const word = room.word
  const gameOver = room.status === 'finished'
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
      if (/^[a-z]$/i.test(event.key) && room.status === 'playing' && socket.connected) {
        onGuess(event.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onGuess, room.status, socket])

  function guess(letter) {
    if (!gameOver && socket.connected && !word.guesses.includes(letter)) onGuess(letter)
  }

  function requestLeave() {
    const departureMessage = isHost
      ? 'Leave this active match? The room will close for the other player.'
      : 'Leave this active match? The other player will remain in the room.'
    if (room.status === 'playing' && !window.confirm(departureMessage)) return
    onLeave()
  }

  function requestBack() {
    const departureMessage = isHost
      ? 'Leave this active match and return to player setup? The room will close for the other player.'
      : 'Leave this active match and return to player setup? The other player will remain in the room.'
    if (room.status === 'playing' && !window.confirm(departureMessage)) return
    onBack()
  }

  async function copyRoomCode() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.')
      await navigator.clipboard.writeText(room.code)
      setCopyStatus('COPIED')
    } catch {
      setCopyStatus('SELECT CODE ABOVE')
    }
  }

  const hostNeedsReady = room.players.some((player) => !player.ready)
  const myPlayer = room.players.find((player) => player.id === socket.id)
  const winner = room.players.find((player) => player.id === word?.winnerId)

  return (
    <section className="online-room-screen">
      <button className="text-button menu-back" type="button" onClick={requestBack}>← BACK</button>
      <div className="online-room-header">
        <div><p className="eyebrow">{room.isPrivate ? 'PRIVATE ROOM' : 'ONLINE ROOM'} // SHARE CODE</p><h1 className="screen-heading">ROOM {room.code}</h1></div>
        <button className="text-button leave-button" type="button" onClick={requestLeave}>LEAVE ROOM</button>
      </div>
      <div className="online-player-strip">
        {room.players.map((player) => (
          <article className={`online-player ${player.id === room.hostId ? 'online-host' : ''}`} key={player.id}>
            <PlayerAvatar avatar={player.avatar} color={player.color} name={player.name} />
            <div><strong>{player.name}</strong><span>{player.score} WINS{player.id === room.hostId ? ' · HOST' : ''}</span></div>
            <span className={`ready-badge ${player.ready ? 'is-ready' : ''}`}>{player.ready ? 'READY' : 'NOT READY'}</span>
          </article>
        ))}
        {room.players.length < 2 && <div className="waiting-player">WAITING FOR PLAYER 2 TO JOIN...</div>}
      </div>

      {room.status === 'waiting' && (
        <div className="lobby-panel">
          {!connected && <p className="form-error" role="status">Connection lost. Room actions are paused until the server reconnects.</p>}
          <p>Race to solve the same hidden word. Every valid guess is shared with both players; the first player to complete the word wins the round.</p>
          <p className="lobby-selection">{room.settings.category} · {DIFFICULTIES[room.settings.difficulty]} · six misses allowed</p>
          <div className="share-code-row"><span>ROOM CODE <strong>{room.code}</strong></span><button className="pixel-button copy-code" type="button" onClick={copyRoomCode}>{copyStatus || 'COPY CODE'}</button></div>
          <div className="lobby-actions">
            <button className="pixel-button" type="button" disabled={!connected || !room.players.some((player) => player.id === socket.id)} onClick={() => onReady(!myPlayer?.ready)}>
              {myPlayer?.ready ? 'CANCEL READY' : 'I AM READY'}
            </button>
            {isHost && (
              <button className="pixel-button start-match" type="button" disabled={!connected || starting || room.players.length !== 2 || hostNeedsReady} onClick={onStart}>
              {starting ? 'STARTING...' : 'START MATCH'}
              </button>
            )}
          </div>
          {isHost && room.players.length < 2 && <p className="waiting-note">Share the code with a friend; the host can start when both players are ready.</p>}
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
        </div>
      )}

      {word && (
        <div className="online-game-board">
          <div className="online-round-meta">
            <span>{word.category} · {DIFFICULTIES[word.difficulty]}</span>
            <span>{word.remaining} / {MAX_MISTAKES} MISSES LEFT</span>
          </div>
          <p className="online-topic">{word.topic}</p>
          <div className="online-stage">
            <HangmanDrawing mistakes={word.mistakes} />
            <div className="online-word">
              {word.slots.map((letter, index) => <span className={`letter-slot ${letter ? 'revealed' : ''}`} key={index}>{letter}</span>)}
            </div>
          </div>
          <div className="online-guesses"><strong>GUESSED:</strong> {word.guesses.join(' · ') || '—'}</div>
          {!gameOver && word.hintAvailable && !word.hint && (
            <button className="hint-button" disabled={!connected} type="button" onClick={onHint}>REVEAL THE SPECIFIC HINT</button>
          )}
          {word.hint && <p className="specific-hint"><strong>WORD HINT:</strong> {word.hint}</p>}
          {gameOver ? (
            <div className={`results-panel ${word.outcome === 'solved' ? 'result-win' : 'result-loss'}`}>
              <p className="result-kicker">{word.outcome === 'solved' ? `${winner?.name || 'A PLAYER'} SOLVED IT` : 'THE WORD WAS'}</p>
              <h2>{word.outcome === 'opponent-left' ? 'PLAYER LEFT THE ROOM' : word.outcome === 'solved' ? 'ROUND WON!' : 'ROUND OVER'}</h2>
              <p className="result-answer">ANSWER <strong>{word.answer}</strong></p>
              <p className="result-hint">{word.hint}</p>
              <button className="pixel-button" type="button" disabled={!connected || myPlayer?.ready} onClick={() => onReady(true)}>
                {myPlayer?.ready ? 'WAITING FOR THE OTHER PLAYER' : 'READY FOR ANOTHER ROUND'}
              </button>
              {isHost && <button className="pixel-button start-match" type="button" disabled={!connected || starting || room.players.length !== 2 || hostNeedsReady} onClick={onStart}>{starting ? 'STARTING...' : 'PLAY AGAIN'}</button>}
            </div>
          ) : (
            <>
              <div className="online-keyboard">
                {ALPHABET.map((letter) => {
                  const guessed = word.guesses.includes(letter)
                  const correct = guessed && word.slots.includes(letter)
                  return (
                    <button
                      className={`key-button ${guessed ? (correct ? 'key-correct' : 'key-incorrect') : ''}`}
                      disabled={guessed || !connected}
                      key={letter}
                      onClick={() => guess(letter)}
                      type="button"
                    >{letter}</button>
                  )
                })}
              </div>
              <p className="online-race-note">SHARED RACE — FIRST TO COMPLETE THE WORD WINS. {myPlayer?.name}, YOUR GUESSES ARE LIVE.</p>
            </>
          )}
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
        </div>
      )}
    </section>
  )
}

export function OnlineRoom({ identity, isPrivate, category, difficulty, onBack }) {
  const serverUrl = import.meta.env.VITE_MULTIPLAYER_SERVER_URL || 'http://localhost:3001'
  const socket = useMemo(() => io(serverUrl, { autoConnect: false, reconnection: true, timeout: 5000 }), [serverUrl])
  const [connection, setConnection] = useState('connecting')
  const [room, setRoom] = useState(null)
  const [code, setCode] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty)
  const [error, setError] = useState('')
  const [joinPending, setJoinPending] = useState(false)
  const [createPending, setCreatePending] = useState(false)
  const [starting, setStarting] = useState(false)
  const [rejoinRequired, setRejoinRequired] = useState(false)
  const roomRef = useRef(null)
  const isHost = room?.hostId === socket.id

  useEffect(() => {
    function connected() { setConnection('connected'); setError('') }
    function disconnected() {
      setConnection('disconnected')
      if (roomRef.current) setRejoinRequired(true)
      roomRef.current = null
      setRoom(null)
      setError('Connection lost. Reconnect and join or create a room again.')
    }
    function connectionError() {
      setConnection('error')
      setError('The multiplayer server is unavailable. Start the backend server and retry.')
    }
    function roomState(nextRoom) {
      roomRef.current = nextRoom
      setRoom(nextRoom)
      setRejoinRequired(false)
      setError('')
    }
    function roomClosed(message) {
      roomRef.current = null
      setRoom(null)
      setError(message?.reason || 'The room is no longer available.')
    }

    socket.on('connect', connected)
    socket.on('disconnect', disconnected)
    socket.on('connect_error', connectionError)
    socket.on('room:state', roomState)
    socket.on('room:closed', roomClosed)
    socket.connect()
    return () => {
      socket.off('connect', connected)
      socket.off('disconnect', disconnected)
      socket.off('connect_error', connectionError)
      socket.off('room:state', roomState)
      socket.off('room:closed', roomClosed)
      socket.disconnect()
    }
  }, [socket])

  function emitAck(event, payload) {
    return new Promise((resolve) => {
      if (!socket.connected) {
        resolve({ ok: false, error: 'Not connected to the multiplayer server.' })
        return
      }
      socket.timeout(5000).emit(event, payload, (timeoutError, response) => {
        resolve(timeoutError ? { ok: false, error: 'The server did not respond. Please try again.' } : response)
      })
    })
  }

  async function createRoom() {
    setCreatePending(true)
    setError('')
    const result = await emitAck('room:create', { ...identity, isPrivate, category: selectedCategory, difficulty: selectedDifficulty })
    setCreatePending(false)
    if (!result.ok) setError(result.error)
    else {
      roomRef.current = result.room
      setRoom(result.room)
      setCode(result.room.code)
      setRejoinRequired(false)
    }
  }

  async function joinRoom(event) {
    event.preventDefault()
    setJoinPending(true)
    setError('')
    const result = await emitAck('room:join', { ...identity, isPrivate, code })
    setJoinPending(false)
    if (!result.ok) setError(result.error)
    else {
      roomRef.current = result.room
      setRoom(result.room)
      setRejoinRequired(false)
    }
  }

  async function leaveRoom() {
    const result = await emitAck('room:leave', {})
    if (!result.ok) {
      setError(result.error)
      return
    }
    roomRef.current = null
    setRoom(null)
    setError('')
  }

  async function backFromRoom() {
    const result = await emitAck('room:leave', {})
    if (!result.ok) {
      setError(result.error)
      return
    }
    roomRef.current = null
    setRoom(null)
    onBack({ category: selectedCategory, difficulty: selectedDifficulty })
  }

  async function ready(readyState) {
    const result = await emitAck('room:ready', { ready: readyState })
    if (!result.ok) setError(result.error)
  }

  async function startMatch() {
    setStarting(true)
    const result = await emitAck('room:start', {})
    setStarting(false)
    if (!result.ok) setError(result.error)
  }

  async function guess(letter) {
    const result = await emitAck('game:guess', { letter })
    if (!result.ok) setError(result.error)
    else setError('')
  }

  async function revealHint() {
    const result = await emitAck('game:hint', {})
    if (!result.ok) setError(result.error)
    else setError('')
  }

  function retryConnection() {
    setConnection('connecting')
    setError('')
    socket.connect()
  }

  function backToPreviousScreen() {
    onBack({ category: selectedCategory, difficulty: selectedDifficulty })
  }

  return (
    <section className="online-page">
      {!room && <button className="text-button menu-back" type="button" onClick={backToPreviousScreen}>← BACK</button>}
      <div className="online-page-header">
        <div><p className="eyebrow">{isPrivate ? 'PRIVATE ROOM' : 'ONLINE MULTIPLAYER'}</p><h1 className="screen-heading">{room ? 'ROOM LOBBY' : 'ROOM LOBBY'}</h1></div>
        <div className={`connection-status connection-${connection}`}><span />{connection === 'connected' ? 'SERVER CONNECTED' : connection === 'connecting' ? 'CONNECTING...' : connection === 'disconnected' ? 'DISCONNECTED' : 'SERVER OFFLINE'}</div>
      </div>

      {connection === 'error' && (
        <div className="server-error">
          <p>{error}</p>
          <p>Online and private rooms use the project’s Socket.IO server. Room codes are issued by that server, not generated in the browser.</p>
          <button className="pixel-button" type="button" onClick={retryConnection}>RETRY CONNECTION</button>
        </div>
      )}

      {room ? (
        <OnlineGame
          actionError={error}
          connected={connection === 'connected'}
          isHost={isHost}
          onBack={backFromRoom}
          onGuess={guess}
          onHint={revealHint}
          onLeave={leaveRoom}
          onReady={ready}
          onStart={startMatch}
          room={room}
          socket={socket}
          starting={starting}
        />
      ) : connection === 'connected' ? (
        <div className="lobby-entry-grid">
          <article className="lobby-entry-card">
            <span className="mode-number">01</span>
            <h2>{isPrivate ? 'CREATE PRIVATE ROOM' : 'CREATE ROOM'}</h2>
            <p>Start a two-player live race. The server creates and validates a shareable room code.</p>
            <div className="settings-panel">
              <label>CATEGORY
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                  {Object.keys(CATEGORIES).map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label>DIFFICULTY
                <select value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
                  {Object.entries(DIFFICULTIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
            <button className="pixel-button" type="button" disabled={connection !== 'connected' || createPending} onClick={createRoom}>{createPending ? 'CREATING...' : `CREATE ${isPrivate ? 'PRIVATE ' : ''}ROOM`}</button>
          </article>
          <article className="lobby-entry-card">
            <span className="mode-number">02</span>
            <h2>JOIN A ROOM</h2>
            <p>Enter the six-character code shared by the room host.</p>
            <form className="join-room-form" onSubmit={joinRoom}>
              <label htmlFor="room-code">ROOM CODE</label>
              <input id="room-code" autoComplete="off" maxLength={6} pattern="[A-Za-z0-9]{6}" placeholder="ABC123" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required />
              <button className="pixel-button" disabled={joinPending || connection !== 'connected'} type="submit">{joinPending ? 'JOINING...' : 'JOIN ROOM'}</button>
            </form>
          </article>
        </div>
      ) : connection !== 'error' ? (
        <div className="connection-wait"><p>{connection === 'disconnected' ? 'Connection lost. Reconnecting...' : 'Connecting to the multiplayer server...'}</p></div>
      ) : null}

      {error && !room && connection !== 'error' && <p className="form-error lobby-error" role="alert">{error}</p>}
      {rejoinRequired && connection === 'connected' && (
        <p className="form-error lobby-error" role="status">
          Connection restored. Your previous room session ended; enter the saved room code to rejoin if it is still available.
        </p>
      )}
    </section>
  )
}
