const EXPIRY_HOURS = 4

export function createEntry(content) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000)
  return {
    id: Date.now() + Math.random(),
    content,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

export function isExpired(entry) {
  return new Date() > new Date(entry.expiresAt)
}

export function filterExpired(entries) {
  return entries.filter(entry => !isExpired(entry))
}