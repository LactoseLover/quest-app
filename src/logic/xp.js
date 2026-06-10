export const defaultProfile = {
  level: 1,
  currentXP: 0,
}

export function xpToNextLevel(level) {
  return level * 100
}

export function applyXP(profile, amount) {
  let currentXP = profile.currentXP + amount
  let level = profile.level
 
  while (currentXP >= xpToNextLevel(level)) {
    currentXP -= xpToNextLevel(level)
    level += 1
  }
 
  return { ...profile, level, currentXP }
}

export function completeTask(profile, task) {
  return applyXP(profile, task.xpReward)
}

export function failTask(profile, task) {
  const newXP = Math.max(0, profile.currentXP - task.xpPenalty)
  return {
    ...profile,
    currentXP: newXP,
  }
}