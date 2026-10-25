export const PROFILE_KEY = 'pixel-woods-player-profile'
export const AVATARS = [
  { id: 'scout', name: 'Scout' },
  { id: 'pilot', name: 'Pilot' },
  { id: 'engineer', name: 'Engineer' },
  { id: 'scholar', name: 'Scholar' },
  { id: 'ranger', name: 'Ranger' },
  { id: 'courier', name: 'Courier' },
]
export const COLORS = ['#4e8c83', '#d88752', '#6f86a5', '#927b65', '#6e8a68', '#a56e62']

function defaultProfile(index = 0) {
  return { name: `Player ${index + 1}`, avatar: AVATARS[index % AVATARS.length].id, color: COLORS[index % COLORS.length] }
}

export function readPlayerProfiles(count = 1) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || '[]')
    if (!Array.isArray(stored)) return Array.from({ length: count }, (_, index) => defaultProfile(index))
    return Array.from({ length: count }, (_, index) => {
      const profile = stored[index]
      return {
        name: typeof profile?.name === 'string' && profile.name.trim() ? profile.name.slice(0, 18) : defaultProfile(index).name,
        avatar: AVATARS.some((avatar) => avatar.id === profile?.avatar) ? profile.avatar : defaultProfile(index).avatar,
        color: COLORS.includes(profile?.color) ? profile.color : defaultProfile(index).color,
      }
    })
  } catch {
    return Array.from({ length: count }, (_, index) => defaultProfile(index))
  }
}

export function savePlayerProfiles(profiles) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles))
  } catch {
    // Player preferences are optional and remain in memory when storage is unavailable.
  }
}
