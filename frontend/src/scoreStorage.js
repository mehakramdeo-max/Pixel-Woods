const STORAGE_KEY = 'pixel-woods-hangman-stats'

export const EMPTY_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
}

function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0
}

export function readStats() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...EMPTY_STATS }

    const parsed = JSON.parse(stored)
    if (
      !parsed ||
      !validCount(parsed.gamesPlayed) ||
      !validCount(parsed.gamesWon) ||
      !validCount(parsed.currentStreak) ||
      !validCount(parsed.bestStreak) ||
      parsed.gamesWon > parsed.gamesPlayed ||
      parsed.currentStreak > parsed.gamesWon ||
      parsed.bestStreak > parsed.gamesWon ||
      parsed.bestStreak < parsed.currentStreak
    ) {
      return { ...EMPTY_STATS }
    }

    return {
      gamesPlayed: parsed.gamesPlayed,
      gamesWon: parsed.gamesWon,
      currentStreak: parsed.currentStreak,
      bestStreak: parsed.bestStreak,
    }
  } catch {
    return { ...EMPTY_STATS }
  }
}

export function saveStats(stats) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    return true
  } catch {
    return false
  }
}
