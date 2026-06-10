export function createTask(title, xpReward, deadline = null) {
  return {
    id: Date.now() + Math.random(),
    title,
    xpReward,
    xpPenalty: Math.round(xpReward / 2),
    deadline,
    completed: false,
    failed: false,
    createdAt: new Date().toISOString(),
  }
}

export function isBossFight(task) {
  return task.deadline !== null
}

export function isOverdue(task) {
  if (!task.deadline) return false
  return new Date() > new Date(task.deadline) && !task.completed
}

export function markComplete(task) {
  return { ...task, completed: true }
}

export function markFailed(task) {
  return { ...task, failed: true }
}