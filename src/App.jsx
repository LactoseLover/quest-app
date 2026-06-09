import { useState } from 'react'
import { defaultProfile, applyXP, completeTask, failTask } from './logic/xp'
import { createTask, markComplete, markFailed, isOverdue, isBossFight } from './logic/tasks'
import { createEntry } from './logic/journal'

export default function App() {
  const [profile, setProfile] = useState(defaultProfile)
  const [tasks, setTasks] = useState([
    createTask("Learn useState", 50),
    createTask("Build task list", 50),
    createTask("Submit project", 120, "2026-05-25")
  ])
  const [newTitle, setNewTitle] = useState("")
  const [newXP, setNewXP] = useState(50)
  const [newDeadline, setNewDeadline] = useState("")
  const [entries, setEntries] = useState([])
  const [journalText, setJournalText] = useState("")

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
  function handleAddTask() {
    if (newTitle.trim() === "") return  // don't add empty tasks

    const task = createTask(
      newTitle,
      Number(newXP),
      newDeadline === "" ? null : newDeadline
    )
    setTasks([...tasks, task])
    setNewTitle("")
    setNewXP(50)
    setNewDeadline("")
  }

  function handleAddEntry() {
    if (journalText.trim() === "") return

    const entry = createEntry(journalText)
    setEntries([...entries, entry])
    setJournalText("")

    // auto-delete this entry after 4 hours
    setTimeout(() => {
      setEntries(prev => prev.filter(e => e.id !== entry.id))
    }, 4 * 60 * 60 * 1000)
  }

  return (
    <div>
      <h1>Level {profile.level}</h1>
      <p>XP: {profile.currentXP}</p>

      <div>
        <h2>Add New Quest</h2>

        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="XP reward"
          value={newXP}
          onChange={(e) => setNewXP(e.target.value)}
        />

        <input
          type="date"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />

        <button onClick={handleAddTask}>Add Quest</button>
      </div>

      <div>
        <h2>Brain Dump</h2>
        <p>Entries delete after 4 hours.</p>

        <textarea
          placeholder="Dump your thoughts..."
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
        />

        <button onClick={handleAddEntry}>Dump It</button>

        {entries.map(entry => (
          <div key={entry.id}>
            <p>{entry.content}</p>
            <small>Expires: {new Date(entry.expiresAt).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

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



