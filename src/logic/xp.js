export const defaultProfile = {
  level: 1,
  currentXP: 0,
  xpToNextLevel: 100,
}

export function xpToNextLevel(level) {
  return level * 100
}

export function applyXP(profile, amount) {
    const newXP = profile.currentXP + amount
    const needed = xpToNextLevel(profile.level)

    if (newXP >= needed) {

        return {
            ...profile, 
            level: profile.level+1,
            currentXP: newXP - needed,
        }
    }
    return {
        ...profile,
        currentXP: newXP,
    }
}

export function completeTask(profile, task) {
    return applyXP(profile, task.xpReward)
}

export function failTask(profile, task) {
    const newXP = Math.max(0, profile.currentXP - task.xpPenalty)
    return {
        ...profile,
        currentXP: newXP
    }
}