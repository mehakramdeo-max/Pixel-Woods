import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALPHABET,
  CATEGORIES,
  DIFFICULTIES,
  HINT_UNLOCK_MISTAKES,
  MAX_MISTAKES,
  getRandomWord,
} from './gameData.js'
import { readStats, saveStats } from './scoreStorage.js'
import { HangmanDrawing } from './HangmanDrawing.jsx'
import { OnlineRoom, PlayerAvatar, PlayerSetup } from './MultiplayerScreens.jsx'
import './App.css'

function WorldDecorations() {
  return (
    <div className="world" aria-hidden="true">
      <div className="pixel-cloud cloud-one" />
      <div className="pixel-cloud cloud-two" />
      <div className="pixel-horizon" />
    </div>
  )
}

function ReactionMessage({ reaction }) {
  const messages = {
    idle: 'Select a letter to begin.',
    correct: 'Correct letter.',
    incorrect: 'Not in the word. Try another.',
    hint: 'Specific clue revealed.',
    victory: 'Solved. Well played.',
    defeat: 'Round complete. Try another word.',
  }

  return <p className={`reaction-message reaction-${reaction}`} aria-live="polite">{messages[reaction]}</p>
}

function ScorePanel({ stats, storageWarning }) {
  return (
    <details className="score-details">
      <summary>ARCADE RECORD <span>▾</span></summary>
      <div className="score-grid">
        <span>GAMES</span><strong>{stats.gamesPlayed}</strong>
        <span>WINS</span><strong>{stats.gamesWon}</strong>
        <span>WIN STREAK</span><strong>{stats.currentStreak}</strong>
        <span>BEST STREAK</span><strong>{stats.bestStreak}</strong>
      </div>
      {storageWarning && <p className="storage-warning">Stats are session-only because browser storage is unavailable.</p>}
    </details>
  )
}

function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState('single')
  const [onlineType, setOnlineType] = useState('public')
  const [onlineIdentity, setOnlineIdentity] = useState(null)
  const [localPlayers, setLocalPlayers] = useState([])
  const [localTurn, setLocalTurn] = useState(0)
  const [localScores, setLocalScores] = useState([0, 0])
  const [localWinner, setLocalWinner] = useState(null)
  const [category, setCategory] = useState('Science and Discovery')
  const [difficulty, setDifficulty] = useState('easy')
  const [wordData, setWordData] = useState(null)
  const [guessedLetters, setGuessedLetters] = useState([])
  const [hintRevealed, setHintRevealed] = useState(false)
  const [lastReaction, setLastReaction] = useState('idle')
  const [roundId, setRoundId] = useState(0)
  const [stats, setStats] = useState(readStats)
  const [storageWarning, setStorageWarning] = useState(false)
  const completedRound = useRef(false)
  const previousWord = useRef(null)

  const mistakes = wordData
    ? guessedLetters.filter((letter) => !wordData.word.includes(letter)).length
    : 0
  const wordLetters = wordData ? [...new Set(wordData.word.split(''))] : []
  const won = wordLetters.length > 0 && wordLetters.every((letter) => guessedLetters.includes(letter))
  const lost = mistakes >= MAX_MISTAKES
  const gameOver = won || lost
  const canResumeSoloGame = wordData &&
    mode === 'single' &&
    !gameOver &&
    wordData.category === category &&
    wordData.difficulty === difficulty

  const resetRoundState = useCallback(() => {
    completedRound.current = false
    setGuessedLetters([])
    setHintRevealed(false)
    setLastReaction('idle')
    setRoundId((currentRound) => currentRound + 1)
  }, [])

  const startRound = useCallback((nextCategory = category, nextDifficulty = difficulty) => {
    resetRoundState()
    setCategory(nextCategory)
    setDifficulty(nextDifficulty)
    setWordData(null)
    const nextWord = getRandomWord(nextCategory, nextDifficulty, previousWord.current)
    previousWord.current = nextWord.word
    setWordData(nextWord)
    setMode('single')
    setLocalPlayers([])
    setLocalWinner(null)
    setScreen('game')
  }, [category, difficulty, resetRoundState])

  const guessLetter = useCallback((letter) => {
    if (gameOver || !wordData || guessedLetters.includes(letter)) return
    const correct = wordData.word.includes(letter)
    const nextGuesses = [...guessedLetters, letter]
    setGuessedLetters(nextGuesses)
    setLastReaction(correct ? 'correct' : 'incorrect')
    if (mode === 'local' && localPlayers.length === 2) {
      const allLettersGuessed = [...new Set(wordData.word)].every((answerLetter) => nextGuesses.includes(answerLetter))
      const nextMistakes = nextGuesses.filter((guess) => !wordData.word.includes(guess)).length
      if (allLettersGuessed) {
        setLocalWinner(localTurn)
        setLocalScores((scores) => scores.map((score, index) => score + (index === localTurn ? 1 : 0)))
      } else if (nextMistakes >= MAX_MISTAKES) {
        setLocalWinner(null)
      } else {
        setLocalTurn((turn) => 1 - turn)
      }
    }
  }, [gameOver, guessedLetters, localPlayers.length, localTurn, mode, wordData])

  useEffect(() => {
    if (screen !== 'game') return undefined

    function handleKeyDown(event) {
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )) return
      if (/^[a-z]$/i.test(event.key)) guessLetter(event.key.toUpperCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, guessLetter])

  useEffect(() => {
    if (screen !== 'game' || !wordData || !gameOver || completedRound.current) return
    completedRound.current = true
    setStats((previousStats) => {
      const nextStreak = won ? previousStats.currentStreak + 1 : 0
      const nextStats = {
        gamesPlayed: previousStats.gamesPlayed + 1,
        gamesWon: previousStats.gamesWon + (won ? 1 : 0),
        currentStreak: nextStreak,
        bestStreak: Math.max(previousStats.bestStreak, nextStreak),
      }
      if (!saveStats(nextStats)) setStorageWarning(true)
      return nextStats
    })
  }, [gameOver, screen, wordData, won])

  function beginGame() {
    if (canResumeSoloGame) {
      setScreen('game')
      return
    }
    startRound(category, difficulty)
  }

  function beginLocalGame(players) {
    setLocalPlayers(players)
    setLocalScores([0, 0])
    startLocalRound()
  }

  function startLocalRound() {
    resetRoundState()
    setMode('local')
    setLocalTurn(0)
    setLocalWinner(null)
    const nextWord = getRandomWord(category, difficulty, previousWord.current)
    previousWord.current = nextWord.word
    setWordData(nextWord)
    setScreen('game')
  }

  function handleCategoryChange(event) {
    const nextCategory = event.target.value
    setCategory(nextCategory)
    if (screen === 'game' && mode === 'single') startRound(nextCategory, difficulty)
  }

  function handleDifficultyChange(event) {
    const nextDifficulty = event.target.value
    setDifficulty(nextDifficulty)
    if (screen === 'game' && mode === 'single') startRound(category, nextDifficulty)
  }

  function restartCurrentGame() {
    if (mode === 'local') startLocalRound()
    else startRound(category, difficulty)
  }

  function openOnline(isPrivate) {
    setOnlineType(isPrivate ? 'private' : 'public')
    setScreen('online-identity')
  }

  function leaveToMenu() {
    setWordData(null)
    setLocalPlayers([])
    setOnlineIdentity(null)
    setMode('single')
    setScreen('menu')
  }

  function handleBrandNavigation() {
    if (screen === 'game' && mode === 'single') {
      setScreen('intro')
      return
    }
    if (screen !== 'menu' && screen !== 'online-room') leaveToMenu()
  }

  function revealSecondHint() {
    if (gameOver || hintRevealed || mistakes < HINT_UNLOCK_MISTAKES) return
    setHintRevealed(true)
    setLastReaction('hint')
  }

  const reaction = gameOver ? (won ? 'victory' : 'defeat') : lastReaction

  return (
    <main className={`game-shell ${screen === 'intro' || screen === 'menu' ? 'intro-shell' : 'play-shell'}`}>
      <WorldDecorations />
      <header className="game-header">
        <button
          className="brand-mark"
          type="button"
          disabled={screen === 'menu' || screen === 'online-room'}
          onClick={handleBrandNavigation}
        >
          <span className="brand-star">★</span> PIXEL PLAY <span className="brand-star">★</span>
        </button>
        <span className="header-chip">PIXEL WOODS <span className="life-dot">●</span></span>
      </header>

      {screen === 'menu' && (
        <section className="main-menu">
          <img
            className="menu-logo"
            src="/images/pixel-woods-logo.png"
            alt="Pixel Woods logo with a woodland Hangman character"
            width="160"
            height="160"
          />
          <p className="eyebrow">PIXEL WOODS ARCADE // WORD GAMES</p>
          <h1 className="menu-title">CHOOSE YOUR MODE</h1>
          <p className="menu-intro">One word. Six misses. Play solo or challenge a friend.</p>
          <div className="mode-grid">
            <button className="mode-card" type="button" onClick={() => { setMode('single'); setScreen('intro') }}>
              <span className="mode-number">01</span><h2>SOLO PLAY</h2>
              <p>Classic Hangman with categories, difficulty, hints, and your local arcade record.</p>
              <span className="mode-action">PLAY SOLO →</span>
            </button>
            <button className="mode-card" type="button" onClick={() => setScreen('local-identity')}>
              <span className="mode-number">02</span><h2>LOCAL MULTIPLAYER</h2>
              <p>Take turns guessing on one device. The player who solves the word takes the round.</p>
              <span className="mode-action">SET UP PLAYERS →</span>
            </button>
            <button className="mode-card" type="button" onClick={() => openOnline(false)}>
              <span className="mode-number">03</span><h2>ONLINE MULTIPLAYER</h2>
              <p>Create a public room or join a friend for a live shared-word race.</p>
              <span className="mode-action">OPEN ONLINE LOBBY →</span>
            </button>
            <button className="mode-card" type="button" onClick={() => openOnline(true)}>
              <span className="mode-number">04</span><h2>PRIVATE ROOM</h2>
              <p>Create a server-hosted private room and share its code with a friend.</p>
              <span className="mode-action">CREATE OR JOIN →</span>
            </button>
          </div>
          <ScorePanel stats={stats} storageWarning={storageWarning} />
        </section>
      )}

      {screen === 'intro' && (
        <section className="intro-content" id="home">
          <button className="text-button menu-back" type="button" onClick={leaveToMenu}>← MAIN MENU</button>
          <div className="intro-badge">SOLO PLAY // A WORD-GUESSING ARCADE</div>
          <h1 className="intro-title">
            <span>READY</span><span className="title-middle">TO</span><span>PLAY<span className="title-question">?</span></span>
          </h1>
          <p className="intro-copy">A little word game from the pixel woods.<br />Can you save the day?</p>
          <div className="how-to-panel">
            <h2>HOW TO PLAY</h2>
            <p>Guess the hidden word one letter at a time.</p>
            <p>Every missed guess brings the drawing closer!</p>
            <div className="instruction-keys"><kbd>A</kbd><span>—</span><kbd>Z</kbd><span> PICK A LETTER</span></div>
          </div>
          <div className="settings-panel intro-settings">
            <label>CATEGORY
              <select value={category} onChange={handleCategoryChange}>
                {Object.keys(CATEGORIES).map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>DIFFICULTY
              <select value={difficulty} onChange={handleDifficultyChange}>
                {Object.entries(DIFFICULTIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <button className="pixel-button start-button" type="button" onClick={beginGame}>
            <span className="button-icon">▶</span> {canResumeSoloGame ? 'RESUME GAME' : 'START GAME'} <span className="button-arrow">→</span>
          </button>
          <p className="intro-footnote">PRESS START WHEN YOU&apos;RE READY!</p>
          <ScorePanel stats={stats} storageWarning={storageWarning} />
        </section>
      )}

      {screen === 'local-identity' && (
        <PlayerSetup
          count={2}
          title="SET UP LOCAL PLAYERS"
          description="Choose display names and pixel characters. Take turns guessing on this device; the word stays hidden during the round."
          submitLabel="START LOCAL MATCH"
          onSubmit={beginLocalGame}
          onBack={leaveToMenu}
        />
      )}

      {screen === 'online-identity' && (
        <PlayerSetup
          count={1}
          title="CHOOSE YOUR PLAYER"
          description="Pick a display name and pixel character. No account or personal details are needed."
          submitLabel="CONTINUE TO ROOM LOBBY"
          onSubmit={(profiles) => { setOnlineIdentity(profiles[0]); setScreen('online-room') }}
          onBack={leaveToMenu}
        />
      )}

      {screen === 'online-room' && onlineIdentity && (
        <OnlineRoom
          identity={onlineIdentity}
          isPrivate={onlineType === 'private'}
          category={category}
          difficulty={difficulty}
          onBack={(settings) => {
            if (settings?.category) setCategory(settings.category)
            if (settings?.difficulty) setDifficulty(settings.difficulty)
            setScreen('online-identity')
          }}
        />
      )}

      {screen === 'game' && wordData && (
        <section className="play-content" aria-label="Hangman game">
          <button
            className="text-button menu-back"
            type="button"
            onClick={mode === 'single' ? () => setScreen('intro') : leaveToMenu}
          >
            {mode === 'single' ? '← SOLO MENU' : '← MAIN MENU'}
          </button>
          <div className="game-title-lockup">
            <p className="eyebrow">{mode === 'single' ? 'THE PIXEL WOODS PRESENT' : 'LOCAL TWO-PLAYER CHALLENGE'}</p>
            <h1 className="game-title"><span>HANG</span><span>MAN</span></h1>
          </div>
          {mode === 'single' ? (
            <div className="settings-panel gameplay-settings">
                <label>CATEGORY
                  <select aria-label="Word category" value={category} onChange={handleCategoryChange}>
                    {Object.keys(CATEGORIES).map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
                <label>DIFFICULTY
                  <select aria-label="Word difficulty" value={difficulty} onChange={handleDifficultyChange}>
                    {Object.entries(DIFFICULTIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
            </div>
          ) : (
            <div className="local-scoreboard">
              {localPlayers.map((player, index) => (
                <div className={`local-player-card ${!gameOver && localTurn === index ? 'local-current-player' : ''}`} key={player.name}>
                  <PlayerAvatar avatar={player.avatar} color={player.color} name={player.name} compact />
                  <span>{player.name}</span>
                  <strong>{localScores[index]} WINS</strong>
                  {!gameOver && localTurn === index && <small>YOUR TURN</small>}
                  {gameOver && localWinner === index && <small>ROUND WINNER</small>}
                </div>
              ))}
            </div>
          )}

          <div className="game-board">
            <div className="board-topline">
              <div className="round-labels">
                <span className="level-label"><span className="level-star">◆</span> {wordData.category}</span>
                {mode === 'single' && <span className="difficulty-label">{DIFFICULTIES[difficulty].toUpperCase()}</span>}
              </div>
              <div className={`attempt-counter ${mistakes >= 4 ? 'attempt-warning' : ''}`}>
                {MAX_MISTAKES - mistakes} / {MAX_MISTAKES} TRIES LEFT
              </div>
            </div>

            <div className="game-stage">
              <div className="drawing-area">
                <span className="drawing-caption">THE MYSTERY TREE</span>
                <HangmanDrawing mistakes={mistakes} />
              </div>
              <div className="word-area">
                <span className="word-caption">GUESS THE WORD</span>
                <div className="word-slots" aria-label="Hidden word">
                  {wordData.word.split('').map((letter, index) => {
                    if (letter === ' ') return <span className="word-space" key={`space-${index}`} aria-hidden="true" />
                    const revealed = guessedLetters.includes(letter) || lost
                    return (
                      <span className={`letter-slot ${revealed ? 'revealed' : ''}`} key={index}>
                        {revealed ? letter : ''}
                      </span>
                    )
                  })}
                </div>
                <p className="word-hint">{wordData.topic}</p>
                <div className="hint-control">
                  {hintRevealed ? (
                    <p className="specific-hint"><strong>WORD HINT:</strong> {wordData.hint || 'Player 1 did not leave an extra hint.'}</p>
                  ) : (
                    <button
                      className="hint-button"
                      disabled={gameOver || mistakes < HINT_UNLOCK_MISTAKES}
                      onClick={revealSecondHint}
                      type="button"
                    >
                      {mistakes < HINT_UNLOCK_MISTAKES
                        ? `WORD HINT UNLOCKS AFTER ${HINT_UNLOCK_MISTAKES} MISSES`
                        : 'REVEAL WORD HINT'}
                    </button>
                  )}
                </div>
                <ReactionMessage reaction={reaction} />
              </div>
            </div>

            {gameOver && (
              <div className={`results-panel ${won ? 'result-win' : 'result-loss'}`} key={`${roundId}-${won ? 'win' : 'loss'}`} role="status">
                {won && <div className="result-sparkles" aria-hidden="true"><span>✦</span><span>★</span><span>✦</span></div>}
                <p className="result-kicker">
                  {mode === 'local'
                    ? localWinner === null ? 'NO WINNER THIS ROUND' : `${localPlayers[localWinner]?.name || 'PLAYER'} TAKES THE ROUND`
                    : won ? 'A PIXEL WOODS CHAMPION!' : 'EVERY HERO HAS ANOTHER TRY'}
                </p>
                <h2>{won ? mode === 'local' ? 'ROUND WON!' : 'YOU DID IT!' : 'NICE TRY!'}</h2>
                <p className="result-answer">THE WORD WAS <strong>{wordData.word}</strong></p>
                <p className="result-topic">{wordData.category}: {wordData.topic}</p>
                <p className="result-hint">{wordData.hint || 'No extra hint was provided.'}</p>
                <button className="pixel-button result-button" type="button" onClick={restartCurrentGame}>
                  {mode === 'local' ? 'NEXT ROUND' : won ? 'PLAY AGAIN' : 'TRY AGAIN'}
                </button>
              </div>
            )}

            <div className="keyboard-area">
              <div className="keyboard-heading">
                <span>CHOOSE YOUR LETTER</span>
                <span className="key-hint">OR USE YOUR KEYBOARD</span>
              </div>
              <div className="keyboard" aria-label="Letter keyboard">
                {ALPHABET.map((letter) => {
                  const guessed = guessedLetters.includes(letter)
                  const correct = guessed && wordData.word.includes(letter)
                  const incorrect = guessed && !wordData.word.includes(letter)
                  return (
                    <button
                      aria-label={`${letter}${correct ? ', correct' : ''}${incorrect ? ', incorrect' : ''}${guessed ? ', already guessed' : ''}`}
                      className={`key-button ${correct ? 'key-correct' : ''} ${incorrect ? 'key-incorrect' : ''}`}
                      disabled={guessed || gameOver}
                      key={letter}
                      onClick={() => guessLetter(letter)}
                      type="button"
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            </div>

            {!gameOver && (
              <button className="pixel-button new-game-button" type="button" onClick={restartCurrentGame}>
                <span className="button-icon">↻</span> NEW GAME
              </button>
            )}
          </div>
          <ScorePanel stats={stats} storageWarning={storageWarning} />
        </section>
      )}

      <footer className="game-footer">
        <span>PIXEL WOODS ARCADE</span>
        <span className="footer-lives">WORD QUEST // 01</span>
        <span>ONE WORD AT A TIME</span>
      </footer>
    </main>
  )
}

export default App
