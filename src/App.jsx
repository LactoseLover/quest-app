import { useState, useEffect } from 'react'
import { defaultProfile, completeTask, failTask, xpToNextLevel } from './logic/xp'
import { createTask, markComplete, markFailed, isOverdue, isBossFight } from './logic/tasks'
import { createEntry } from './logic/journal'
import Landing from './Landing'
import './App.css'

function getTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  if (diff <= 0) return 'EXPIRED'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}H ${m}M`
}

function getDeadlineCountdown(deadline) {
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return 'OVERDUE'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `${d}D ${h}H LEFT`
  return `${h}H LEFT`
}

function getNow() {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
    .toUpperCase().replace(/,/g, '') + ' // ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('profile')
    return saved ? JSON.parse(saved) : defaultProfile
  })
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : [
      createTask("Learn useState", 50),
      createTask("Build task list", 80),
      createTask("Submit portfolio project", 120, new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]),
    ]
  })
  const [newTitle, setNewTitle] = useState("")
  const [newXP, setNewXP] = useState(50)
  const [newDeadline, setNewDeadline] = useState("")
  const [entries, setEntries] = useState([])
  const [journalText, setJournalText] = useState("")
  const [showLanding, setShowLanding] = useState(true)
  const [notification, setNotification] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />
  }

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  function handleComplete(task) {
    const updatedProfile = completeTask(profile, task)
    const updatedTasks = tasks.map(t => t.id === task.id ? markComplete(t) : t)
    setProfile(updatedProfile)
    setTasks(updatedTasks)
    const leveled = updatedProfile.level > profile.level
    if (leveled) {
      showNotif(`LEVEL UP — YOU ARE NOW LEVEL ${updatedProfile.level}`, 'levelup')
    } else {
      showNotif(`QUEST COMPLETE — +${task.xpReward} XP GAINED`, 'success')
    }
  }

  function handleFail(task) {
    const updatedProfile = failTask(profile, task)
    const updatedTasks = tasks.map(t => t.id === task.id ? markFailed(t) : t)
    setProfile(updatedProfile)
    setTasks(updatedTasks)
    showNotif(`QUEST FAILED — −${task.xpPenalty} XP LOST`, 'danger')
  }

  function handleAddTask() {
    if (newTitle.trim() === "") return
    const task = createTask(newTitle, Number(newXP), newDeadline === "" ? null : newDeadline)
    setTasks([...tasks, task])
    setNewTitle("")
    setNewXP(50)
    setNewDeadline("")
    setShowAddForm(false)
    showNotif(`NEW QUEST REGISTERED — ${newTitle.toUpperCase()}`, 'success')
  }

  function handleAddEntry() {
    if (journalText.trim() === "") return
    const entry = createEntry(journalText)
    setEntries(prev => [...prev, entry])
    setJournalText("")
    setTimeout(() => {
      setEntries(prev => prev.filter(e => e.id !== entry.id))
    }, 4 * 60 * 60 * 1000)
  }

  const xpNeeded = xpToNextLevel(profile.level)
  const xpPercent = Math.min(100, Math.round((profile.currentXP / xpNeeded) * 100))
  const activeTasks = tasks.filter(t => !t.completed && !t.failed)
  const bossFights = activeTasks.filter(isBossFight)
  const dailyQuests = activeTasks.filter(t => !isBossFight(t))
  const doneTasks = tasks.filter(t => t.completed || t.failed)

  const calDays = Array.from({ length: 30 }, (_, i) => i + 1)
  const today = new Date().getDate()
  const taskDays = new Set(tasks.map(t => t.deadline ? new Date(t.deadline).getDate() : null).filter(Boolean))
  const bossDays = new Set(tasks.filter(isBossFight).map(t => new Date(t.deadline).getDate()))

  return (
    <div className="app">
      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* Notification */}
      {notification && (
        <div className={`notification notif-${notification.type}`}>
          <span className="notif-icon">!</span>
          <div>
            <div className="notif-label">NOTIFICATION</div>
            <div className="notif-text">{notification.msg}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="sys-title">◈ SYSTEM INTERFACE v1.0.0</div>
        <div className="sys-status"><span className="status-dot" />ACTIVE SESSION</div>
        <div className="sys-clock">{getNow()}</div>
      </div>

      <div className="main-grid">

        {/* LEFT — Character Panel */}
        <div className="panel char-panel">
          <div className="corner corner-tl" /><div className="corner corner-tr" />
          <div className="corner corner-bl" /><div className="corner corner-br" />
          <div className="panel-label">PLAYER</div>

          <div className="char-name">HUNTER</div>
          <div className="char-class">// SHADOW ARCHITECT</div>

          <div className="level-badge">
            <div>
              <div className="lvl-label">LVL</div>
              <div className="lvl-num">{String(profile.level).padStart(2, '0')}</div>
            </div>
            <div className="rank-label">SHADOW<br />RANK {profile.level < 5 ? 'E' : profile.level < 10 ? 'D' : 'C'}</div>
          </div>

          <div className="xp-header">
            <span>EXPERIENCE</span>
            <span>{profile.currentXP} / {xpNeeded}</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>

          <div className="stat-row">
            <span className="stat-key">QUESTS DONE</span>
            <span className="stat-val">{String(tasks.filter(t => t.completed).length).padStart(2, '0')}</span>
          </div>
          <div className="stat-row">
            <span className="stat-key">BOSS KILLS</span>
            <span className="stat-val">{String(tasks.filter(t => t.completed && isBossFight(t)).length).padStart(2, '0')}</span>
          </div>
          <div className="stat-row">
            <span className="stat-key">ACTIVE</span>
            <span className="stat-val">{String(activeTasks.length).padStart(2, '0')}</span>
          </div>
          <div className="stat-row" style={{ borderBottom: 'none' }}>
            <span className="stat-key">FAILED</span>
            <span className="stat-val danger-val">{String(tasks.filter(t => t.failed).length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* CENTER — Quests */}
        <div className="panel quest-panel">
          <div className="corner corner-tl" /><div className="corner corner-tr" />
          <div className="corner corner-bl" /><div className="corner corner-br" />
          <div className="panel-label">ACTIVE QUESTS</div>

          {bossFights.length > 0 && (
            <>
              <div className="section-label">BOSS FIGHTS</div>
              {bossFights.map(task => (
                <div key={task.id} className="quest-item boss-item">
                  <div className="quest-icon boss-icon">⚔</div>
                  <div className="quest-info">
                    <div className="boss-badge-tag">BOSS FIGHT</div>
                    <div className="quest-title boss-title">{task.title}</div>
                    <div className="quest-meta boss-meta">
                      DEADLINE // {new Date(task.deadline).toLocaleDateString('en-GB').replace(/\//g, '.')} — {getDeadlineCountdown(task.deadline)}
                    </div>
                  </div>
                  <div className="quest-right">
                    <div className="quest-xp boss-xp">+{task.xpReward} XP</div>
                    <div className="quest-actions">
                      <button className="q-btn complete-btn" onClick={() => handleComplete(task)}>✓</button>
                      <button className="q-btn fail-btn" onClick={() => handleFail(task)}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {dailyQuests.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: bossFights.length ? '14px' : '0' }}>DAILY QUESTS</div>
              {dailyQuests.map(task => (
                <div key={task.id} className="quest-item normal-item">
                  <div className="quest-icon">□</div>
                  <div className="quest-info">
                    <div className="quest-title">{task.title}</div>
                    <div className="quest-meta">REWARD // {task.xpReward} XP · PENALTY // −{task.xpPenalty} XP</div>
                  </div>
                  <div className="quest-right">
                    <div className="quest-xp">+{task.xpReward} XP</div>
                    <div className="quest-actions">
                      <button className="q-btn complete-btn" onClick={() => handleComplete(task)}>✓</button>
                      <button className="q-btn fail-btn" onClick={() => handleFail(task)}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {doneTasks.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: '14px', opacity: 0.5 }}>COMPLETED</div>
              {doneTasks.map(task => (
                <div key={task.id} className={`quest-item done-item ${task.failed ? 'failed-item' : ''}`}>
                  <div className="quest-icon" style={{ opacity: 0.4 }}>{task.completed ? '✓' : '✕'}</div>
                  <div className="quest-info">
                    <div className="quest-title" style={{ textDecoration: 'line-through', opacity: 0.4 }}>{task.title}</div>
                    <div className="quest-meta" style={{ opacity: 0.4 }}>{task.completed ? 'COMPLETED' : 'FAILED'}</div>
                  </div>
                  <div className="quest-xp" style={{ opacity: 0.3, color: task.failed ? '#ff6666' : undefined }}>
                    {task.completed ? `+${task.xpReward}` : `−${task.xpPenalty}`} XP
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTasks.length === 0 && doneTasks.length === 0 && (
            <div className="empty-state">NO ACTIVE QUESTS — ADD ONE BELOW</div>
          )}

          {/* Add quest form */}
          <div style={{ marginTop: '16px' }}>
            {!showAddForm ? (
              <button className="sys-btn" onClick={() => setShowAddForm(true)}>+ ADD QUEST</button>
            ) : (
              <div className="add-form">
                <div className="form-label">NEW QUEST</div>
                <input
                  className="sys-input"
                  type="text"
                  placeholder="Quest title..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  autoFocus
                />
                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <div className="input-label">XP REWARD</div>
                    <input
                      className="sys-input"
                      type="number"
                      value={newXP}
                      onChange={e => setNewXP(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="input-label">DEADLINE (BOSS FIGHT)</div>
                    <input
                      className="sys-input"
                      type="date"
                      value={newDeadline}
                      onChange={e => setNewDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <button className="sys-btn" onClick={handleAddTask}>REGISTER QUEST</button>
                  <button className="sys-btn danger-btn" onClick={() => setShowAddForm(false)}>CANCEL</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Calendar + Journal */}
        <div className="right-col">

          {/* Calendar — TOP */}
          <div className="panel cal-panel">
            <div className="corner corner-tl" /><div className="corner corner-tr" />
            <div className="corner corner-bl" /><div className="corner corner-br" />
            <div className="panel-label">CALENDAR</div>

            <div className="cal-month">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>

            <div className="cal-grid">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="cal-head">{d}</div>
              ))}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() === 0 ? 6 : new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() - 1 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calDays.map(d => (
                <div key={d} className={`cal-day ${d === today ? 'cal-today' : ''} ${bossDays.has(d) ? 'cal-boss' : taskDays.has(d) ? 'cal-task' : ''}`}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Brain Dump — BOTTOM */}
          <div className="panel journal-panel">
            <div className="corner corner-tl" /><div className="corner corner-tr" />
            <div className="corner corner-bl" /><div className="corner corner-br" />
            <div className="panel-label">BRAIN DUMP</div>

            <textarea
              className="sys-textarea"
              placeholder="// transmit thoughts..."
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
            />
            <button className="sys-btn" style={{ width: '100%', marginBottom: '12px' }} onClick={handleAddEntry}>
              TRANSMIT
            </button>

            <div className="journal-entries-list">
              {entries.length === 0 && (
                <div className="empty-state">NO ACTIVE TRANSMISSIONS</div>
              )}
              {entries.map(entry => (
                <div key={entry.id} className="journal-entry">
                  <div className="journal-content">{entry.content}</div>
                  <div className="journal-timer">⏱ EXPIRES IN {getTimeRemaining(entry.expiresAt)}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}