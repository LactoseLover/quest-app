import { useState } from 'react'
import { defaultProfile, applyXP, completeTask, failTask } from './logic/xp'
import { createTask, markComplete, markFailed, isOverdue, isBossFight } from './logic/tasks'

export default function App() {
  const [profile, setProfile] = useState(defaultProfile)
  const [tasks, setTasks] = useState([
    createTask("Learn useState", 50),
    createTask("Build task list", 50),
    createTask("Submit project", 120, "2026-05-25")
  ])

  function handleComplete(task) {
    const updatedProfile = completeTask(profile, task)
    const updatedTasks = tasks.map(t => t.id === task.id ? markComplete(t) : t)
    setProfile(updatedProfile)
    setTasks(updatedTasks)
  }

  function handleFail(task) {
    const updatedProfile = failTask(profile, task)
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? markFailed(t) : t
    )
    setProfile(updatedProfile)
    setTasks(updatedTasks)
  }

  return (
    <div>
      <h1>Level {profile.level}</h1>
      <p>XP: {profile.currentXP}</p>

      {tasks.map(task => (
        <div key={task.id}>
          <h3>{isBossFight(task) ? "⚠ BOSS: " : ""}{task.title}</h3>
          <p>Reward: {task.xpReward} XP</p>
          {isOverdue(task) && <p>OVERDUE</p>}

          {!task.completed && !task.failed && (
            <>
              <button onClick={() => handleComplete(task)}>Complete</button>
              <button onClick={() => handleFail(task)}>Fail</button>
            </>
          )}

          {task.completed && <p>✅ Done</p>}
          {task.failed && <p>❌ Failed</p>}
        </div>
      ))}
    </div>
  )

}



